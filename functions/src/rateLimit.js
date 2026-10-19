import { createHash } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
export async function consumeRateLimit(db, uid, operation, limit = 20) {
  const ref = db.doc(`operationRateLimits/${createHash('sha256').update(`${operation}:${uid}`).digest('hex')}`);
  const now = Date.now(), minute = Math.floor(now / 60000);
  await db.runTransaction(async tx => {
    const prior = (await tx.get(ref)).data();
    const count = prior?.minute === minute ? prior.count : 0;
    if (count >= limit) throw new HttpsError('resource-exhausted', 'Too many requests. Please wait a minute.');
    tx.set(ref, { minute, count: count + 1, expiresAt: Timestamp.fromMillis(now + 3600000) });
  });
}
