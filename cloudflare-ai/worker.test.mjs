import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import worker from './src/index.js';
const env = { AI_BRIDGE_SECRET: 'local-fixture-bridge', AI_ENABLED: 'true', GEMINI_API_KEY: 'fixture' };
function request(body, time = String(Date.now()), secret = env.AI_BRIDGE_SECRET) {
  return new Request('https://example.workers.dev/internal/reply', { method:'POST', body,
    headers:{'X-ASB-Time':time,'X-ASB-Signature':createHmac('sha256',secret).update(`${time}.${body}`).digest('hex')} });
}
test('bridge rejects missing, forged and stale authentication without provider requests', async () => {
  for (const req of [new Request('https://example.workers.dev/internal/reply',{method:'POST',body:'{}'}), request('{}',String(Date.now()-120000)), request('{}',String(Date.now()),'wrong')])
    assert.equal((await worker.fetch(req,env)).status,401);
});
test('bridge rejects malformed input and disabled service', async () => {
  assert.equal((await worker.fetch(request('invalid'),env)).status,400);
  assert.equal((await worker.fetch(request('{"messages":[]}'),env)).status,400);
  assert.equal((await worker.fetch(request('{}'),{...env,AI_ENABLED:'false'})).status,503);
  assert.equal((await worker.fetch(new Request('https://example.workers.dev/chat',{method:'POST'}),env)).status,404);
});
test('signed bridge sends bounded context and handles structured Gemini reply', async () => {
  const old = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.match(url,/generativelanguage.googleapis.com/);
    assert.equal(options.headers['x-goog-api-key'],'fixture');
    assert.equal(JSON.parse(options.body).contents[0].parts[0].text,'How do I apply?');
    return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({text:'Complete your membership application.',escalate:false})}]}}]}));
  };
  try {
    const result = await worker.fetch(request(JSON.stringify({messages:[{role:'user',text:'How do I apply?'}],context:'Verified facts'})),env);
    assert.equal(result.status,200); assert.deepEqual(await result.json(),{text:'Complete your membership application.',escalate:false});
  } finally { globalThis.fetch=old; }
});
test('provider errors return a safe retriable response', async () => {
  const old=globalThis.fetch; globalThis.fetch=async()=>new Response('unavailable',{status:503});
  try { assert.equal((await worker.fetch(request(JSON.stringify({messages:[{role:'user',text:'Hello'}]})),env)).status,503); }
  finally { globalThis.fetch=old; }
});
