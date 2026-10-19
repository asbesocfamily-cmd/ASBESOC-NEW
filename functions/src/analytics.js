import { createHash } from 'node:crypto';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { normalizeEvent, summarizeEvents, RETENTION_DAYS } from './analyticsPolicy.js';

const ADMIN = 'RJJhn4WSoBhUQ5vMF7G9vxLB98E2';
const hash = value => createHash('sha256').update(value).digest('hex');
const admin = request => {
  if (request.auth?.uid !== ADMIN || request.auth.token.email_verified !== true)
    throw new HttpsError('permission-denied', 'Administrator access required.');
};
export const recordWebsiteVisit = onCall({ enforceAppCheck: true, maxInstances: 3 }, async request => {
  const db = getFirestore();
  const config = (await db.doc('systemConfig/analytics').get()).data();
  if (config?.enabled !== true) return { accepted: false };
  let event;
  try { event = normalizeEvent(request.data); } catch { throw new HttpsError('invalid-argument', 'Invalid analytics event.'); }
  if (event.kind === 'signup' && !request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  const now = Date.now();
  const retention = Math.min(RETENTION_DAYS, Math.max(1, Number(config.retentionDays) || RETENTION_DAYS));
  const expiresAt = Timestamp.fromMillis(now + retention * 86400000);
  const visitor = hash(event.visitorId), session = hash(`${event.visitorId}:${event.sessionId}`);
  const visitorRef = db.doc(`analyticsVisitors/${visitor}`);
  const sessionRef = db.doc(`analyticsSessions/${session}`);
  const eventRef = db.doc(`analyticsEvents/${event.kind === 'signup' ? `signup-${hash(request.auth.uid)}` : event.eventId}`);
  const accepted = await db.runTransaction(async tx => {
    const [seen, visitorSnap, sessionSnap] = await Promise.all([tx.get(eventRef), tx.get(visitorRef), tx.get(sessionRef)]);
    if (seen.exists) return true;
    const previous = sessionSnap.data();
    // Heartbeats at most once/minute; page changes at most once/second/session.
    const minimum = event.kind === 'heartbeat' ? 55000 : event.kind === 'signup' ? 0 : 1000;
    if (previous?.lastEventAt?.toMillis() > now - minimum) return false;
    const minute = Math.floor(now / 60000);
    const count = previous?.minute === minute ? previous.count || 0 : 0;
    if (count >= 30) throw new HttpsError('resource-exhausted', 'Please retry later.');
    const known = visitorSnap.exists && visitorSnap.data().expiresAt.toMillis() > now;
    const firstTime = !known || visitorSnap.data().firstSession === session;
    tx.set(visitorRef, { firstSession: known ? visitorSnap.data().firstSession : session, lastSeenAt: Timestamp.fromMillis(now), expiresAt });
    tx.set(sessionRef, { lastSeenAt: Timestamp.fromMillis(now), lastEventAt: Timestamp.fromMillis(now), minute, count: count + 1, expiresAt });
    tx.create(eventRef, { kind: event.kind, visitor, session, page: event.page, previous: event.previous,
      device: event.device, browser: event.browser, os: event.os, referrer: event.referrer,
      member: Boolean(request.auth), firstTime, createdAt: Timestamp.fromMillis(now), expiresAt });
    return true;
  });
  return { accepted };
});

export const websiteAnalyticsReport = onCall({ enforceAppCheck: true }, async request => {
  admin(request);
  const db = getFirestore();
  const config = (await db.doc('systemConfig/analytics').get()).data();
  const now = Date.now(), oldest = now - RETENTION_DAYS * 86400000;
  const start = request.data?.start ? Date.parse(request.data.start) : now - 7 * 86400000;
  const end = request.data?.end ? Date.parse(request.data.end) : now;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || end > now + 86400000)
    throw new HttpsError('invalid-argument', 'Invalid report dates.');
  const rows = await db.collection('analyticsEvents').where('createdAt', '>=', Timestamp.fromMillis(Math.max(oldest, start)))
    .where('createdAt', '<=', Timestamp.fromMillis(end)).orderBy('createdAt', 'desc').limit(20001).get();
  const events = rows.docs.slice(0, 20000).map(doc => ({ ...doc.data(), time: doc.data().createdAt.toMillis() }))
    .filter(e => e.expiresAt.toMillis() > now);
  const live = await db.collection('analyticsEvents').where('createdAt', '>=', Timestamp.fromMillis(now - 300000)).limit(20001).get();
  const summary = summarizeEvents(events, now);
  summary.activeSessions = new Set(live.docs.slice(0,20000).filter(d => d.data().expiresAt.toMillis() > now).map(d => d.data().session)).size;
  return { ...summary, enabled: config?.enabled === true, retentionDays: config?.retentionDays || RETENTION_DAYS,
    truncated: rows.size > 20000 || live.size > 20000, start: new Date(Math.max(start, oldest)).toISOString(), end: new Date(end).toISOString(),
    location: 'Unavailable: no IP addresses or location lookups are collected.' };
});

export const configureWebsiteAnalytics = onCall({ enforceAppCheck: true }, async request => {
  admin(request);
  const { enabled, retentionDays } = request.data || {};
  if (typeof enabled !== 'boolean' || !Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > RETENTION_DAYS)
    throw new HttpsError('invalid-argument', 'Choose a retention period from 1 to 90 days.');
  await getFirestore().doc('systemConfig/analytics').set({ enabled, retentionDays });
  return { enabled, retentionDays };
});

export const expireWebsiteAnalytics = onSchedule({ schedule: 'every 24 hours', timeoutSeconds: 540 }, async () => {
  const db = getFirestore();
  const config = (await db.doc('systemConfig/analytics').get()).data();
  const retention = Math.min(RETENTION_DAYS, Math.max(1, Number(config?.retentionDays) || RETENTION_DAYS));
  for (const collection of ['analyticsEvents', 'analyticsVisitors', 'analyticsSessions', 'operationRateLimits']) {
    // Shortening retention also removes records created under a longer policy.
    const cutoff = Timestamp.fromMillis(Date.now() - retention * 86400000);
    for (const [field, threshold] of [['expiresAt', Timestamp.now()], [collection === 'analyticsEvents' ? 'createdAt' : 'lastSeenAt', cutoff]]) {
      for (let page = 0; page < 100; page++) {
        const expired = await db.collection(collection).where(field, '<=', threshold).limit(400).get();
        if (expired.empty) break;
        const batch = db.batch(); expired.docs.forEach(doc => batch.delete(doc.ref)); await batch.commit();
      }
    }
  }
});
