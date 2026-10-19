import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { activeMembership, annualPeriod, assertVerifiedPayment, priceFor, reminderStage, requirePaymentConfiguration, verifySignature } from '../src/policy.js';
import { paymentOutcome } from '../src/policy.js';
const config = { enabled: true, verificationConfigured: true, annualPolicy: 'anniversary', enabledCurrencies: ['NGN', 'USD'] };
const order = { reference: 'ASB-test-reference', amountMinor: 500000, currency: 'NGN', email: 'member@example.org', uid: 'member-123' };
const payment = { reference: order.reference, amount: 500000, currency: 'NGN', customer: {email:order.email}, metadata:{uid:order.uid}, paid_at:'2026-10-10T12:00:00Z', status:'success',domain:'live',id:12345 };
test('checkout fails closed without activation, policy approval and live credential', () => {
  for (const candidate of [undefined, {}, {...config,enabled:false}, {...config,verificationConfigured:false}, {...config,annualPolicy:'calendar'}, {...config,enabledCurrencies:[]}])
    assert.throws(() => requirePaymentConfiguration(candidate, 'sk_live_example'));
  assert.throws(() => requirePaymentConfiguration(config, 'sk_test_example'));
  assert.doesNotThrow(() => requirePaymentConfiguration(config, 'sk_live_example'));
});
test('server prices are exactly NGN 5000 or USD 5 in minor units', () => {
  assert.equal(priceFor('NGN',config),500000); assert.equal(priceFor('USD',config),500);
  assert.throws(() => priceFor('GBP',config)); assert.throws(() => priceFor('USD',{enabledCurrencies:['NGN']}));
});
test('accept matching live verification', () => assert.doesNotThrow(() => assertVerifiedPayment(payment,order)));
test('pending and failed provider states never count as paid and still require an exact order match',()=>{
  assert.equal(paymentOutcome(payment,order),'paid');
  assert.equal(paymentOutcome({...payment,status:'pending',paid_at:null},order),'pending');
  assert.equal(paymentOutcome({...payment,status:'failed',paid_at:null},order),'failed');
  assert.throws(()=>paymentOutcome({...payment,status:'pending',amount:1},order));
  assert.throws(()=>paymentOutcome({...payment,status:'unknown'},order));
});
for (const [field,value] of Object.entries({status:'pending',domain:'test',reference:'other',amount:499999,currency:'USD',id:0,customer:{email:'attacker@example.org'},metadata:{uid:'attacker'},paid_at:'bad'})) {
  test(`reject mismatched ${field}`,()=>assert.throws(()=>assertVerifiedPayment({...payment,[field]:value},order)));
}
test('webhook signatures bind exact bytes and reject malformed or forged values', () => {
  const raw=Buffer.from('{"event":"charge.success"}');
  const signature=createHmac('sha512','secret').update(raw).digest('hex');
  assert.equal(verifySignature(raw,signature,'secret'),true);
  assert.equal(verifySignature(Buffer.from('{}'),signature,'secret'),false);
  for(const value of [undefined,'','abc','0'.repeat(128)]) assert.equal(verifySignature(raw,value,'secret'),false);
});
test('anniversary renewal preserves unused time and handles leap years', () => {
  assert.equal(annualPeriod(new Date('2024-02-29T12:00:00Z')).expiresAt.toISOString(),'2025-02-28T12:00:00.000Z');
  const now=new Date('2026-10-10T12:00:00Z');
  assert.equal(annualPeriod(now).expiresAt.toISOString(),'2027-10-10T12:00:00.000Z');
  assert.equal(annualPeriod(now,new Date('2026-10-20T12:00:00Z')).expiresAt.toISOString(),'2027-10-20T12:00:00.000Z');
  assert.equal(annualPeriod(now,new Date('2026-09-20T12:00:00Z')).startsAt.toISOString(),now.toISOString());
});
test('entitlements fail closed at expiry, on revocation, absent or future periods', () => {
  const now=new Date('2026-10-10T12:00:00Z');
  const member={status:'active',startsAt:{toMillis:()=>now.getTime()-1},expiresAt:{toMillis:()=>now.getTime()+1}};
  assert.equal(activeMembership(member,now),true);
  assert.equal(activeMembership({...member,status:'revoked'},now),false);
  assert.equal(activeMembership({...member,expiresAt:{toMillis:()=>now.getTime()}},now),false);
  assert.equal(activeMembership({...member,startsAt:{toMillis:()=>now.getTime()+1}},now),false);
  assert.equal(Boolean(activeMembership(null,now)),false);
});
test('reminders select 30 days, 7 days and expired without early notifications', () => {
  const now=new Date('2026-10-10T12:00:00Z');
  for(const [days,stage] of [[31,null],[30,'30-days'],[7,'7-days'],[0,'expired'],[-1,'expired']])
    assert.equal(reminderStage(new Date(now.getTime()+days*86400000),now),stage);
});
