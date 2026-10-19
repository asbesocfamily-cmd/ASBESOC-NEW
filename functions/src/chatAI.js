import { createHmac, randomUUID } from 'node:crypto';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';

const bridgeSecret = defineSecret('AI_BRIDGE_SECRET');
const INTRO = "Hello! I'm Miss Chididmma, ASBESOC's automated support assistant. ";
const FALLBACK = 'An ASBESOC administrator will need to assist with this question. Your message is in the support inbox.';

export async function handleChatMessage(db, event, generate) {
  const message = event.data?.data();
  if (message?.senderRole !== 'member' || typeof message.text !== 'string') return;
  const { uid, messageId } = event.params;
  const chatRef = db.doc(`memberChats/${uid}`);
  const replyRef = chatRef.collection('messages').doc(`ai-${messageId}`);
  const lease = randomUUID();
  const acquired = await db.runTransaction(async tx => {
    const [chatSnap, replySnap] = await Promise.all([tx.get(chatRef), tx.get(replyRef)]);
    const chat = chatSnap.data();
    if (!chat || replySnap.exists || chat.status !== 'waiting' || chat.aiEscalated === true ||
        !chat.lastMemberMessageAt?.isEqual(message.createdAt)) return null;
    if (chat.aiLeaseUntil?.toMillis() > Date.now()) throw new Error('AI lease busy; retry event.');
    const minute = Math.floor(Date.now() / 60000);
    const count = chat.aiMinute === minute ? chat.aiCount || 0 : 0;
    if (count >= 6) {
      tx.update(chatRef, { aiEscalated: true, aiError: 'rate_limited' });
      return null;
    }
    tx.update(chatRef, { aiLease: lease, aiLeaseUntil: Timestamp.fromMillis(Date.now() + 60000), aiMinute: minute, aiCount: count + 1 });
    return { epoch: chat.aiEpoch || 0 };
  });
  if (!acquired) return;
  let result;
  try {
    const history = await chatRef.collection('messages').orderBy('createdAt', 'desc').limit(12).get();
    result = await generate(history.docs.reverse().filter(d => d.id !== 'support-ack').map(d => {
      const m = d.data();
      return { role: m.senderRole === 'member' ? 'user' : 'assistant', text: String(m.text || '').slice(0, 4000) };
    }));
    if (typeof result?.text !== 'string' || !result.text.trim()) throw new Error('Empty provider reply');
  } catch {
    result = { text: FALLBACK, escalate: true };
  }
  await db.runTransaction(async tx => {
    const [chatSnap, replySnap] = await Promise.all([tx.get(chatRef), tx.get(replyRef)]);
    const chat = chatSnap.data();
    if (!chat || replySnap.exists || chat.aiLease !== lease) return;
    tx.update(chatRef, { aiLeaseUntil: Timestamp.fromMillis(0) });
    // Epoch rejects stale generations even after a takeover/release cycle.
    if (chat.status !== 'waiting' || (chat.aiEpoch || 0) !== acquired.epoch ||
        chat.aiEscalated === true || !chat.lastMemberMessageAt?.isEqual(message.createdAt)) return;
    tx.create(replyRef, { senderId: 'asbesoc-ai', senderRole: 'system',
      text: `${chat.aiIntroduced ? '' : INTRO}${result.text.trim()}`.slice(0, 4000), createdAt: FieldValue.serverTimestamp() });
    tx.update(chatRef, { aiIntroduced: true, aiEscalated: result.escalate === true,
      aiError: result.escalate ? 'administrator_required' : null, updatedAt: FieldValue.serverTimestamp() });
  });
}

async function respondToEvent(event) {
  if (event.data?.data()?.senderRole !== 'member') return;
  const db = getFirestore();
  const config = (await db.doc('systemConfig/supportAI').get()).data();
  if (config?.enabled !== true) return;
  const endpoint = new URL(config.workerUrl);
  if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.workers.dev') || endpoint.pathname !== '/internal/reply')
    throw new Error('Invalid AI worker configuration');
  await handleChatMessage(db, event, async messages => {
    const body = JSON.stringify({ messages, context: String(config.verifiedContext || '').slice(0, 16000) });
    const timestamp = String(Date.now());
    const signature = createHmac('sha256', bridgeSecret.value()).update(`${timestamp}.${body}`).digest('hex');
    const response = await fetch(endpoint, { method: 'POST', body,
      headers: { 'Content-Type': 'application/json', 'X-ASB-Time': timestamp, 'X-ASB-Signature': signature },
      signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error('AI provider unavailable');
    return response.json();
  });
}
const triggerOptions = { region: 'europe-west1', retry: true, secrets: [bridgeSecret], timeoutSeconds: 60 };
export const memberChatAutoReply = onDocumentCreated({ ...triggerOptions,
  document: 'memberChats/{uid}/messages/{messageId}',
}, respondToEvent);
export const memberChatReleased = onDocumentUpdated({ ...triggerOptions, document: 'memberChats/{uid}' }, async event => {
  const before = event.data?.before.data(), after = event.data?.after.data();
  if (after?.status !== 'waiting' || (before?.status === 'waiting' && before?.aiEpoch === after.aiEpoch)) return;
  const latest = await getFirestore().collection(`memberChats/${event.params.uid}/messages`)
    .where('senderRole', '==', 'member').orderBy('createdAt', 'desc').limit(1).get();
  if (latest.empty) return;
  await respondToEvent({ data: latest.docs[0], params: { uid: event.params.uid, messageId: latest.docs[0].id } });
});
