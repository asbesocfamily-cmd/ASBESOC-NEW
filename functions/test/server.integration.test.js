import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApps, deleteApp } from 'firebase-admin/app';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { membershipCheckout, confirmMembershipPayment, downloadMembershipCertificate,
  verifyMembershipCertificate, revokeMembership, membershipRenewalReminders } from '../src/index.js';

// Static fixtures exist only in a localhost emulator with a demo project.
// No provider success is mocked and no real member is marked paid/certified.
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
