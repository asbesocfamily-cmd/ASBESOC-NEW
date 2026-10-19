import { generateGeminiReply } from './gemini.js';
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
export async function validBridge(request, env, body) {
  const time = request.headers.get('X-ASB-Time') || '';
  const signature = request.headers.get('X-ASB-Signature') || '';
  if (!env.AI_BRIDGE_SECRET || !/^\d{13}$/.test(time) || Math.abs(Date.now() - Number(time)) > 60000 || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.AI_BRIDGE_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, Uint8Array.from(signature.match(/../g), v => parseInt(v, 16)), new TextEncoder().encode(`${time}.${body}`));
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') return json({ service: 'ASBESOC AI', status: 'online' });
    if (url.pathname !== '/internal/reply') return json({ error: 'Not found' }, 404);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (Number(request.headers.get('content-length')) > 70000) return json({ error: 'Too large' }, 413);
    const body = await request.text();
    if (body.length > 70000) return json({ error: 'Too large' }, 413);
    if (!await validBridge(request, env, body)) return json({ error: 'Unauthorized' }, 401);
    if (env.AI_ENABLED !== 'true') return json({ error: 'Support unavailable' }, 503);
    let data;
    try { data = JSON.parse(body); } catch { return json({ error: 'Invalid JSON' }, 400); }
    if (!Array.isArray(data.messages) || !data.messages.length || data.messages.length > 12 ||
        data.messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.text !== 'string' || m.text.length > 4000))
      return json({ error: 'Invalid conversation' }, 400);
    try { return json(await generateGeminiReply(env.GEMINI_API_KEY, data.messages, String(data.context || ''), env.GEMINI_MODEL)); }
    catch { return json({ error: 'Support unavailable' }, 503); }
  },
};
