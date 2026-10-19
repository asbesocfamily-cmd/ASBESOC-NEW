import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApps, deleteApp } from 'firebase-admin/app';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { handleChatMessage } from '../src/chatAI.js';
import { recordWebsiteVisit, websiteAnalyticsReport, configureWebsiteAnalytics, expireWebsiteAnalytics } from '../src/analytics.js';
import { randomUUID } from 'node:crypto';
import { consumeRateLimit } from '../src/rateLimit.js';
import { membershipCheckout, confirmMembershipPayment, downloadMembershipCertificate,
  verifyMembershipCertificate, revokeMembership, membershipRenewalReminders, membershipPaymentReceipt } from '../src/index.js';

// Static fixtures exist only in a localhost emulator with a demo project.
// Provider fixtures are isolated to this demo emulator; no real member or provider is changed.
const db = getFirestore();
const uid = 'server-fixture-owner';
const admin = 'RJJhn4WSoBhUQ5vMF7G9vxLB98E2';
const auth = value => ({ uid: value, token: { email_verified: true, email: `${value}@example.org` } });
const time = days => Timestamp.fromMillis(Date.now() + days * 86400000);
const id = 'ASBESOC-server-fixture-valid';
let environment;
before(async () => {
  assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(localhost|127\.0\.0\.1):\d+$/);
  assert.equal(process.env.GCLOUD_PROJECT, 'demo-asbesoc-membership');
  environment = await initializeTestEnvironment({ projectId: 'demo-asbesoc-membership' });
  await environment.clearFirestore();
  await db.doc(`membershipApplications/${uid}`).set({ status: 'approved', userId: uid, fullName: 'Local Test Fixture', paymentStatus:'unpaid' });
  await db.doc(`memberships/${uid}`).set({ status:'active',startsAt:time(-2),expiresAt:time(6),certificateId:id });
  await db.doc(`certificates/${id}`).set({id,uid,fullName:'Local Test Fixture',status:'active',issuedAt:time(-2),startsAt:time(-2),expiresAt:time(6),paymentReference:'PRIVATE-REFERENCE'});
});
after(async () => { await environment?.cleanup(); await Promise.all(getApps().map(app => deleteApp(app))); });
test('checkout and confirmation require verified identity', async () => {
  for(const fn of [membershipCheckout,confirmMembershipPayment]) {
    await assert.rejects(fn.run({data:{currency:'NGN',reference:'ASB-local-fixture'}}), {code:'unauthenticated'});
    await assert.rejects(fn.run({auth:{uid,token:{email_verified:false}},data:{currency:'NGN'}}), {code:'unauthenticated'});
  }
});
test('disabled configuration and test credentials cannot start payments', async () => {
  await db.doc('systemConfig/payments').set({enabled:false});
  await assert.rejects(membershipCheckout.run({auth:auth(uid),data:{currency:'NGN'}}),{code:'failed-precondition'});
  await db.doc('systemConfig/payments').set({enabled:true,verificationConfigured:true,annualPolicy:'anniversary',enabledCurrencies:['NGN','USD']});
  await assert.rejects(membershipCheckout.run({auth:auth(uid),data:{currency:'NGN'}}),{code:'failed-precondition'});
  assert.equal((await db.doc(`membershipApplications/${uid}`).get()).data().paymentStatus,'unpaid');
  await db.doc('systemConfig/payments').set({enabled:false});
});
test('public verification exposes only the minimal certificate fields', async () => {
  const result=await verifyMembershipCertificate.run({data:{id}});
  assert.equal(result.status,'valid');
  assert.deepEqual(Object.keys(result).sort(),['expiresAt','fullName','id','issuedAt','startsAt','status'].sort());
  assert.equal((await verifyMembershipCertificate.run({data:{id:'ASBESOC-nonexistent-fixture'}})).status,'not_found');
});
test('certificate PDF requires owner or administrator', async () => {
  await assert.rejects(downloadMembershipCertificate.run({data:{id}}),{code:'unauthenticated'});
  await assert.rejects(downloadMembershipCertificate.run({auth:auth('another-fixture-owner'),data:{id}}),{code:'not-found'});
  const result=await downloadMembershipCertificate.run({auth:auth(uid),data:{id}});
  assert.equal(Buffer.from(result.base64,'base64').subarray(0,4).toString(),'%PDF');
});
test('public verification fails closed when canonical membership expires', async () => {
  await db.doc(`memberships/${uid}`).update({expiresAt:time(-1)});
  assert.equal((await verifyMembershipCertificate.run({data:{id}})).status,'expired');
  await assert.rejects(downloadMembershipCertificate.run({auth:auth(uid),data:{id}}),{code:'failed-precondition'});
  await db.doc(`memberships/${uid}`).update({expiresAt:time(6)});
});
test('repeated reminder job produces one notice for the same term and stage', async () => {
  await membershipRenewalReminders.run({});
  await membershipRenewalReminders.run({});
  const rows=await db.collection(`membershipReminders/${uid}/items`).get();
  assert.equal(rows.size,1);assert.equal(rows.docs[0].data().stage,'7-days');
});
test('revocation is admin-only, auditable, idempotent and disables certificate access', async () => {
  await assert.rejects(revokeMembership.run({auth:auth(uid),data:{uid,reason:'Test revocation'}}),{code:'permission-denied'});
  const request={auth:auth(admin),data:{uid,reason:'Local fixture revocation'}};
  await revokeMembership.run(request); await revokeMembership.run(request);
  assert.equal((await verifyMembershipCertificate.run({data:{id}})).status,'revoked');
  await assert.rejects(downloadMembershipCertificate.run({auth:auth(uid),data:{id}}),{code:'failed-precondition'});
  const events=await db.collection('membershipAudit').where('uid','==',uid).get();
  assert.equal(events.size,1);assert.equal(events.docs[0].data().actor,admin);
});

async function chatFixture(name) {
  const ref=db.doc(`memberChats/${name}`), createdAt=Timestamp.now();
  await ref.set({status:'waiting',aiEpoch:0,lastMemberMessageAt:createdAt});
  await ref.collection('messages').doc('m1').set({senderId:name,senderRole:'member',text:'How do I apply?',createdAt});
  return {ref,event:{params:{uid:name,messageId:'m1'},data:{data:()=>({senderRole:'member',text:'How do I apply?',createdAt})}}};
}
test('AI replies once despite redelivery, introduces once, and preserves context', async()=>{
  const {ref,event}=await chatFixture('ai-idempotency'); let calls=0;
  const generate=async history=>{calls++;assert.equal(history.at(-1).text,'How do I apply?');return{text:'Complete the application.',escalate:false};};
  await handleChatMessage(db,event,generate);await handleChatMessage(db,event,generate);
  assert.equal(calls,1);assert.match((await ref.collection('messages').doc('ai-m1').get()).data().text,/automated support assistant/);
  const createdAt=Timestamp.fromMillis(Date.now()+1);await ref.update({lastMemberMessageAt:createdAt});
  await ref.collection('messages').doc('m2').set({senderRole:'member',text:'Thank you',createdAt});
  await handleChatMessage(db,{params:{uid:'ai-idempotency',messageId:'m2'},data:{data:()=>({senderRole:'member',text:'Thank you',createdAt})}},async()=>({text:'You are welcome.',escalate:false}));
  assert.equal((await ref.collection('messages').doc('ai-m2').get()).data().text,'You are welcome.');
});
test('AI rejects replies generated across takeover and release, and resumes safely',async()=>{
  const {ref,event}=await chatFixture('ai-race');
  await handleChatMessage(db,event,async()=>{
    await ref.update({status:'active',aiEpoch:1});await ref.update({status:'waiting',aiEpoch:2});
    return{text:'STALE reply',escalate:false};
  });
  assert.equal((await ref.collection('messages').doc('ai-m1').get()).exists,false);
  await handleChatMessage(db,event,async()=>({text:'Current reply',escalate:false}));
  assert.match((await ref.collection('messages').doc('ai-m1').get()).data().text,/Current reply/);
});
test('AI failure escalates durably and active administrator suppresses provider calls',async()=>{
  const {ref,event}=await chatFixture('ai-failure');
  await ref.update({status:'active'});
  await handleChatMessage(db,event,async()=>{throw new Error('Should not run');});
  assert.equal((await ref.collection('messages').doc('ai-m1').get()).exists,false);
  await ref.update({status:'waiting'});
  await handleChatMessage(db,event,async()=>{throw new Error('Provider timeout');});
  assert.equal((await ref.get()).data().aiEscalated,true);
  assert.match((await ref.collection('messages').doc('ai-m1').get()).data().text,/administrator/);
});
test('analytics admin access, event idempotency, minimization, and retention',async()=>{
  await assert.rejects(websiteAnalyticsReport.run({data:{}}),{code:'permission-denied'});
  await assert.rejects(configureWebsiteAnalytics.run({auth:auth(uid),data:{enabled:true,retentionDays:90}}),{code:'permission-denied'});
  await configureWebsiteAnalytics.run({auth:auth(admin),data:{enabled:true,retentionDays:90}});
  const event={eventId:randomUUID(),visitorId:randomUUID(),sessionId:randomUUID(),kind:'page',page:'/gallery?email=private',referrer:'https://source.example/private',device:'Mobile',browser:'Chrome',os:'Android'};
  await recordWebsiteVisit.run({data:event});await recordWebsiteVisit.run({data:event});
  const rows=await db.collection('analyticsEvents').get();assert.equal(rows.size,1);
  const stored=rows.docs[0].data();assert.equal(stored.page,'/other');assert.equal(stored.referrer,'source.example');
  assert.equal('visitorId' in stored,false);assert.equal('email' in stored,false);
  const report=await websiteAnalyticsReport.run({auth:auth(admin),data:{}});
  assert.equal(report.visits,1);assert.equal(report.uniqueVisitors,1);assert.equal(report.activeSessions,1);
  await rows.docs[0].ref.update({createdAt:time(-20)});
  await configureWebsiteAnalytics.run({auth:auth(admin),data:{enabled:false,retentionDays:7}});
  await expireWebsiteAnalytics.run({});assert.equal((await db.collection('analyticsEvents').get()).size,0);
  assert.deepEqual(await recordWebsiteVisit.run({data:event}),{accepted:false});
});

test('concurrent verified settlements and replays issue one term, certificate and owner-only receipt',async()=>{
  const oldFetch=globalThis.fetch, oldSecret=process.env.PAYSTACK_SECRET_KEY;
  const fixtureUid='settlement-fixture-owner',reference='ASB-settlement-local-fixture',email='fixture@example.org';
  const order={uid:fixtureUid,reference,email,fullName:'Isolated Settlement Fixture',amountMinor:500000,currency:'NGN',status:'pending',createdAt:Timestamp.now()};
  await db.doc(`membershipApplications/${fixtureUid}`).set({userId:fixtureUid,status:'approved',fullName:order.fullName});
  await db.doc(`paymentOrders/${reference}`).set(order);
  await db.doc('systemConfig/payments').set({enabled:true,verificationConfigured:true,annualPolicy:'anniversary',enabledCurrencies:['NGN']});
  process.env.PAYSTACK_SECRET_KEY='sk_live_local_fixture_not_a_real_key';
  globalThis.fetch=async url=>{
    assert.equal(String(url),`https://api.paystack.co/transaction/verify/${reference}`);
    return new Response(JSON.stringify({status:true,data:{...order,id:991234,status:'success',domain:'live',customer:{email},metadata:{uid:fixtureUid},amount:order.amountMinor,paid_at:new Date().toISOString()}}));
  };
  try {
    const request={auth:{uid:fixtureUid,token:{email_verified:true,email}},data:{reference}};
    await Promise.all([confirmMembershipPayment.run(request),confirmMembershipPayment.run(request)]);
    const membership=(await db.doc(`memberships/${fixtureUid}`).get()).data();
    const expiry=membership.expiresAt.toMillis();
    await confirmMembershipPayment.run(request);
    assert.equal((await db.doc(`memberships/${fixtureUid}`).get()).data().expiresAt.toMillis(),expiry);
    assert.equal((await db.collection('certificates').where('uid','==',fixtureUid).get()).size,1);
    const receipt=await membershipPaymentReceipt.run(request);assert.equal(receipt.amountMinor,500000);assert.equal(receipt.status,'paid');
    await assert.rejects(membershipPaymentReceipt.run({auth:auth(uid),data:{reference}}),{code:'not-found'});
  } finally {
    globalThis.fetch=oldFetch;process.env.PAYSTACK_SECRET_KEY=oldSecret;
    await db.doc('systemConfig/payments').set({enabled:false});
  }
});
test('durable operation quota rejects excess calls across repeated transactions',async()=>{
  await consumeRateLimit(db,'quota-fixture','fixture',2);
  await consumeRateLimit(db,'quota-fixture','fixture',2);
  await assert.rejects(consumeRateLimit(db,'quota-fixture','fixture',2),{code:'resource-exhausted'});
});
