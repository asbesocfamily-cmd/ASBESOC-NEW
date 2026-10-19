import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, getDocFromServer, updateDoc, Timestamp, serverTimestamp, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { hasUnreadReply } from '../../src/firebase/chatReadState.ts';
import { saveMemberReadReceipt } from '../../src/firebase/chatReadReceipt.ts';
import { clientApp, clientFirestore } from '../../scripts/firestore-test-sdk.mjs';
const enabled = !!process.env.FIRESTORE_EMULATOR_HOST;
let env;
const admin = 'RJJhn4WSoBhUQ5vMF7G9vxLB98E2';
before(async () => {
  if (!enabled) return;
  env = await initializeTestEnvironment({ projectId: 'demo-asbesoc-membership', firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') } });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db,'membershipApplications/member-123'),{userId:'member-123',status:'pending',paymentStatus:'not_available',certificateStatus:'not_available'});
    await setDoc(doc(db,'memberFeed/training'),{type:'training',title:'Private training',body:'Protected content',published:true});
    await setDoc(doc(db,'memberFeed/announcement'),{type:'announcement',title:'Notice',body:'Public member notice',published:true});
    for (const [uid, status, expiresAt] of [['active-member','active',Date.now()+86400000],['expired-member','active',Date.now()-1],['revoked-member','revoked',Date.now()+86400000]])
      await setDoc(doc(db,`memberships/${uid}`),{status,startsAt:Timestamp.fromMillis(Date.now()-86400000),expiresAt:Timestamp.fromMillis(expiresAt)});
    await setDoc(doc(db,'memberships/future-member'),{status:'active',startsAt:Timestamp.fromMillis(Date.now()+86400000),expiresAt:Timestamp.fromMillis(Date.now()+2*86400000)});
    await setDoc(doc(db,'certificates/private-certificate'),{uid:'member-123',status:'active'});
  });
});
after(async()=>{if(env)await env.cleanup()});
const run=(name,fn)=>test(name,{skip:!enabled},fn);
const dbFor=uid=>env.authenticatedContext(uid,{email_verified:true,email:`${uid}@example.org`}).firestore();
run('analytics and AI control records reject direct client access and forged automation',async()=>{
  for(const uid of ['member-123',admin]) {
    for(const path of ['analyticsEvents/private','analyticsVisitors/private','analyticsSessions/private','systemConfig/supportAI','systemConfig/analytics']) {
      await assertFails(getDoc(doc(dbFor(uid),path)));
      await assertFails(setDoc(doc(dbFor(uid),path),{enabled:true}));
    }
  }
  await env.withSecurityRulesDisabled(async context=>{
    await setDoc(doc(context.firestore(),'memberChats/member-123'),{status:'waiting',memberId:'member-123',aiEpoch:0});
  });
  await assertFails(updateDoc(doc(dbFor('member-123'),'memberChats/member-123'),{aiEpoch:1,aiEscalated:false}));
  await assertFails(setDoc(doc(dbFor('member-123'),'memberChats/member-123/messages/forged-ai'),{senderId:'asbesoc-ai',senderRole:'system',text:'Approved',createdAt:serverTimestamp()}));
  await assertSucceeds(updateDoc(doc(dbFor(admin),'memberChats/member-123'),{status:'active',aiEpoch:1,updatedAt:serverTimestamp()}));
  await assertSucceeds(updateDoc(doc(dbFor(admin),'memberChats/member-123'),{status:'waiting',aiEpoch:2,aiEscalated:false,updatedAt:serverTimestamp()}));
});
run('applicant cannot mark self paid or certified',async()=>{
  await assertFails(updateDoc(doc(dbFor('member-123'),'membershipApplications/member-123'),{paymentStatus:'paid',certificateStatus:'issued'}));
});
run('admin client cannot mark applicant paid or create entitlements',async()=>{
  await assertFails(updateDoc(doc(dbFor(admin),'membershipApplications/member-123'),{paymentStatus:'paid',certificateStatus:'issued'}));
  for(const path of ['memberships/new-member','certificates/new-certificate','paymentOrders/new-payment','providerReceipts/new-receipt','systemConfig/payments'])
    await assertFails(setDoc(doc(dbFor(admin),path),{status:'active',enabled:true}));
});
run('approval requires atomic review history and remains unpaid',async()=>{
  const db=dbFor(admin), ref=doc(db,'membershipApplications/member-123');
  const value={status:'approved',paymentStatus:'unpaid',certificateStatus:'payment_required',reviewNote:'Approved',reviewedBy:admin,reviewedAt:serverTimestamp()};
  await assertFails(updateDoc(ref,value));
  const batch=writeBatch(db);batch.update(ref,value);batch.set(doc(db,'membershipApplications/member-123/reviews/approved'),{status:'approved',previousStatus:'pending',note:'Approved',reviewedBy:admin,createdAt:serverTimestamp()});
  await assertSucceeds(batch.commit());
});
run('membership and certificate records isolate owners and deny anonymous reads',async()=>{
  await assertFails(getDoc(doc(dbFor('other-member'),'certificates/private-certificate')));
  await assertSucceeds(getDoc(doc(dbFor('member-123'),'certificates/private-certificate')));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'certificates/private-certificate')));
});
run('training requires current unrevoked membership',async()=>{
  await assertSucceeds(getDoc(doc(dbFor('active-member'),'memberFeed/training')));
  for(const uid of ['member-123','expired-member','revoked-member','future-member']) await assertFails(getDoc(doc(dbFor(uid),'memberFeed/training')));
  await assertSucceeds(getDoc(doc(dbFor('member-123'),'memberFeed/announcement')));
});

function application(uid) {
  return {fullName:'Test Applicant',dateOfBirth:'1990-01-01',gender:'Female',phone:'+2348012345678',
    email:`${uid}@example.org`,nationality:'Nigerian',residentialAddress:'Test address',country:'Nigeria',state:'Enugu',lga:'Enugu North',
    occupation:'Teacher',qualification:'Degree',reasonForJoining:'Community service',membershipInterests:['Training / Capacity Building'],
    referralSource:'Website',userId:uid,status:'pending',paymentStatus:'not_available',certificateStatus:'not_available',submissionType:'membership',createdAt:serverTimestamp()};
}
run('verified account can apply once and cannot overwrite its application',async()=>{
  const uid='new-applicant',db=dbFor(uid),ref=doc(db,`membershipApplications/${uid}`);
  await assertSucceeds(setDoc(ref,application(uid)));
  await assertFails(setDoc(ref,application(uid)));
});
run('unverified and anonymous accounts cannot submit applications',async()=>{
  const uid='unverified-member';
  const db=env.authenticatedContext(uid,{email_verified:false,email:`${uid}@example.org`}).firestore();
  await assertFails(setDoc(doc(db,`membershipApplications/${uid}`),application(uid)));
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(),`membershipApplications/${uid}`),application(uid)));
});
run('application identity and initial status cannot be forged',async()=>{
  const uid='forgery-test-member',db=dbFor(uid);
  await assertFails(setDoc(doc(db,'membershipApplications/someone-else'),application(uid)));
  for(const fields of [{userId:'someone-else'},{email:'other@example.org'},{status:'approved'},{paymentStatus:'paid'},{certificateStatus:'issued'},{membershipExpiresAt:Timestamp.now()}])
    await assertFails(setDoc(doc(db,`membershipApplications/${uid}`),{...application(uid),...fields}));
});
run('applicants cannot read another application or make review decisions',async()=>{
  const db=dbFor('unrelated-member');
  await assertFails(getDoc(doc(db,'membershipApplications/member-123')));
  await assertFails(updateDoc(doc(db,'membershipApplications/member-123'),{status:'approved'}));
  await assertFails(setDoc(doc(db,'membershipApplications/member-123/reviews/rejected'),{status:'rejected'}));
});
run('review history cannot be altered or appended without a valid transition',async()=>{
  const db=dbFor(admin);
  await assertFails(updateDoc(doc(db,'membershipApplications/member-123/reviews/approved'),{note:'Rewritten'}));
  await assertFails(setDoc(doc(db,'membershipApplications/member-123/reviews/rejected'),{status:'rejected',previousStatus:'approved',note:'Changed',reviewedBy:admin,createdAt:serverTimestamp()}));
});
run('unverified accounts cannot read training even with seeded entitlement',async()=>{
  const db=env.authenticatedContext('active-member',{email_verified:false}).firestore();
  await assertFails(getDoc(doc(db,'memberFeed/training')));
});
run('application moves through review and approval while remaining unpaid',async()=>{
  const uid='workflow-test-member',owner=dbFor(uid),reviewer=dbFor(admin);
  await assertSucceeds(setDoc(doc(owner,`membershipApplications/${uid}`),application(uid)));
  for(const [previousStatus,status] of [['pending','under_review'],['under_review','approved']]) {
    const batch=writeBatch(reviewer);
    batch.update(doc(reviewer,`membershipApplications/${uid}`),{status,reviewNote:'Local workflow test',reviewedAt:serverTimestamp(),reviewedBy:admin,
      ...(status==='approved'?{paymentStatus:'unpaid',certificateStatus:'payment_required'}:{})});
    batch.set(doc(reviewer,`membershipApplications/${uid}/reviews/${status}`),{status,previousStatus,note:'Local workflow test',reviewedBy:admin,createdAt:serverTimestamp()});
    await assertSucceeds(batch.commit());
  }
  const result=await assertSucceeds(getDoc(doc(owner,`membershipApplications/${uid}`)));
  assert.equal(result.data().status,'approved');assert.equal(result.data().paymentStatus,'unpaid');assert.equal(result.data().certificateStatus,'payment_required');
  await assertFails(getDoc(doc(owner,'memberFeed/training')));
});
run('profile editing cannot grant roles or alter another account',async()=>{
  const uid='profile-test-member',db=dbFor(uid),profile={fullName:'Test Member',phone:'',updatedAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(db,`profiles/${uid}`),profile));
  await assertFails(setDoc(doc(db,`profiles/${uid}`),{...profile,role:'admin'}));
  await assertFails(setDoc(doc(db,'profiles/someone-else'),profile));
});
run('noncertified member feed query excludes protected training',async()=>{
  const db=dbFor('member-123');
  await assertSucceeds(getDocs(query(collection(db,'memberFeed'),where('published','==',true),where('type','in',['announcement','opportunity']))));
  await assertFails(getDocs(query(collection(db,'memberFeed'),where('published','==',true))));
});

run('reply receipts persist across clients, preserve newer unread replies and enforce ownership', async (t) => {
  const uid = 'chat-reader', path = `memberChats/${uid}`;
  const app = clientApp.initializeApp({ projectId: 'demo-asbesoc-membership', apiKey: 'demo-key' }, 'chat-read-test');
  const client = clientFirestore.getFirestore(app);
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  clientFirestore.connectFirestoreEmulator(client, host, Number(port), { mockUserToken: { sub: uid, email_verified: true, email: `${uid}@example.org` } });
  t.after(async () => { await clientFirestore.terminate(client); await clientApp.deleteApp(app); });
  const first = new Timestamp(100, 100000), second = new Timestamp(100, 200000);
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, path), { memberId: uid, status: 'active', lastAdminMessageAt: first });
    await setDoc(doc(db, `${path}/messages/first`), { senderId: admin, senderRole: 'admin', text: 'First reply', createdAt: first });
    await setDoc(doc(db, `${path}/messages/member`), { senderId: uid, senderRole: 'member', text: 'Question', createdAt: first });
  });
  const ref = doc(dbFor(uid), path);
  const receipt = { memberReadAt: first, memberReadMessageId: 'first' };
  assert.equal(hasUnreadReply((await getDocFromServer(ref)).data()), true);
  await assertSucceeds(saveMemberReadReceipt(client, uid, { id: 'first', senderRole: 'admin', createdAt: new clientFirestore.Timestamp(first.seconds, first.nanoseconds) }));
  // A fresh authenticated client must see the server receipt without local state.
  const fresh = doc(dbFor(uid), path);
  assert.equal(hasUnreadReply((await getDocFromServer(fresh)).data()), false);
  await assertFails(updateDoc(doc(dbFor('other-chat-member'), path), receipt));
  await assertFails(getDoc(doc(dbFor('other-chat-member'), path)));
  await assertFails(updateDoc(doc(env.unauthenticatedContext().firestore(), path), receipt));
  await assertFails(updateDoc(doc(env.authenticatedContext(uid, { email_verified: false }).firestore(), path), receipt));
  await assertFails(updateDoc(ref, { memberReadAt: second, memberReadMessageId: 'first' }));
  await assertFails(updateDoc(ref, { memberReadAt: first, memberReadMessageId: 'missing' }));
  await assertFails(updateDoc(ref, { memberReadAt: first, memberReadMessageId: 'member' }));
  await assertFails(updateDoc(ref, { ...receipt, adminReadAt: first }));
  await assertFails(updateDoc(ref, { ...receipt, status: 'resolved' }));
  await assertFails(updateDoc(ref, { memberReadAt: serverTimestamp() }));
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, `${path}/messages/second`), { senderId: admin, senderRole: 'admin', text: 'New reply', createdAt: second });
    await updateDoc(doc(db, path), { lastAdminMessageAt: second });
  });
  await assertSucceeds(updateDoc(ref, receipt));
  assert.equal(hasUnreadReply((await getDocFromServer(fresh)).data()), true);
  await assertSucceeds(saveMemberReadReceipt(client, uid, { id: 'second', senderRole: 'admin', createdAt: new clientFirestore.Timestamp(second.seconds, second.nanoseconds) }));
  assert.equal(hasUnreadReply((await getDocFromServer(fresh)).data()), false);
  await assertSucceeds(saveMemberReadReceipt(client, uid, { id: 'first', senderRole: 'admin', createdAt: new clientFirestore.Timestamp(first.seconds, first.nanoseconds) }));
  assert.equal(hasUnreadReply((await getDocFromServer(fresh)).data()), false);
  await assertFails(updateDoc(ref, receipt));
  await assertSucceeds(updateDoc(doc(dbFor(admin), path), { adminReadAt: serverTimestamp() }));
});
