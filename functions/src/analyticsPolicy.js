export const RETENTION_DAYS = 90;
const paths = new Set(['/', '/about', '/programs', '/projects', '/gallery', '/contact', '/signup', '/login', '/membership', '/dashboard']);
export function safePage(value) {
  return typeof value === 'string' && value.startsWith('/dashboard') ? '/dashboard' : paths.has(value) ? value : '/other';
}
export function normalizeEvent(data) {
  const uuid = /^[a-f0-9-]{36}$/i;
  if (!data || !uuid.test(data.eventId) || !uuid.test(data.visitorId) || !uuid.test(data.sessionId) ||
      !['page', 'heartbeat', 'signup'].includes(data.kind)) throw new Error('Invalid analytics event');
  let referrer = 'direct';
  try { const url = new URL(data.referrer); if (url.protocol === 'https:' || url.protocol === 'http:') referrer = url.hostname.slice(0, 150); } catch { /* direct */ }
  const pick = (value, allowed) => allowed.includes(value) ? value : 'Other';
  return { eventId: data.eventId, visitorId: data.visitorId, sessionId: data.sessionId, kind: data.kind,
    page: safePage(data.page), previous: safePage(data.previous), referrer,
    device: pick(data.device, ['Mobile', 'Tablet', 'Desktop']),
    os: pick(data.os, ['Windows', 'Android', 'iOS', 'macOS', 'Linux']),
    browser: pick(data.browser, ['Edge', 'Firefox', 'Chrome', 'Safari']) };
}
export function summarizeEvents(events, now = Date.now()) {
  const pages = events.filter(e => e.kind === 'page');
  const tally = (rows, key) => Object.entries(rows.reduce((counts, row) => {
    const value = key(row); counts[value] = (counts[value] || 0) + 1; return counts;
  }, Object.create(null))).map(([label, count]) => ({ label, count })).sort((a,b) => b.count - a.count);
  const unique = new Set(pages.map(e => e.visitor));
  const first = new Set(pages.filter(e => e.firstTime).map(e => e.visitor));
  return {
    pageviews: pages.length, visits: new Set(pages.map(e => e.session)).size, uniqueVisitors: unique.size,
    firstTime: first.size, returning: new Set(pages.filter(e => !e.firstTime).map(e => e.visitor)).size,
    activeSessions: new Set(events.filter(e => e.time >= now - 300000).map(e => e.session)).size,
    members: new Set(pages.filter(e => e.member).map(e => e.session)).size,
    guests: new Set(pages.filter(e => !e.member).map(e => e.session)).size,
    signups: new Set(events.filter(e => e.kind === 'signup').map(e => e.visitor)).size,
    pages: tally(pages, e => e.page), sources: tally(pages, e => e.referrer),
    devices: tally(pages, e => e.device), browsers: tally(pages, e => e.browser), operatingSystems: tally(pages, e => e.os),
    navigation: tally(pages.filter(e => e.previous && e.previous !== '/other'), e => `${e.previous} → ${e.page}`),
    daily: tally(pages, e => new Date(e.time).toISOString().slice(0,10)).sort((a,b) => a.label.localeCompare(b.label)),
  };
}
