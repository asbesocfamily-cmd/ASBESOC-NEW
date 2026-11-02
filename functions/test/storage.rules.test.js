import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';

const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || '';
const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '';
const enabled = /^(localhost|127\.0\.0\.1):\d+$/.test(firestoreHost)
  && /^(localhost|127\.0\.0\.1):\d+$/.test(storageHost);
const projectId = 'demo-asbesoc-membership';
const adminUid = 'RJJhn4WSoBhUQ5vMF7G9vxLB98E2';
let env;

before(async () => {
  if (!enabled) return;
  env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') },
    storage: { rules: readFileSync(new URL('../../storage.rules', import.meta.url), 'utf8') },
  });
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'membershipApplications/approved-member'), { status: 'approved' });
    await setDoc(doc(db, 'membershipApplications/pending-member'), { status: 'pending' });

    const storage = context.storage();
    await storage.ref('media/public/public-image/hero.png').put(new Uint8Array([1, 2, 3, 4]), { contentType: 'image/png' });
    await storage.ref('media/members/shared-image/member.png').put(new Uint8Array([1, 2, 3, 4]), { contentType: 'image/png' });
    await storage.ref('media/approved_members/approved-image/member.png').put(new Uint8Array([1, 2, 3, 4]), { contentType: 'image/png' });
    await storage.ref('media/private/private-image/secret.png').put(new Uint8Array([1, 2, 3, 4]), { contentType: 'image/png' });
    await storage.ref('media/members/delete-ready/member.png').put(new Uint8Array([1, 2, 3, 4]), { contentType: 'image/png' });
    await storage.ref('media/members/in-use/member.png').put(new Uint8Array([1, 2, 3, 4]), { contentType: 'image/png' });

    await setDoc(doc(db, 'media/delete-ready'), {
      state: 'deleting', path: 'media/members/delete-ready/member.png', uses: [], size: 4, contentType: 'image/png',
    });
    await setDoc(doc(db, 'media/in-use'), {
      state: 'deleting', path: 'media/members/in-use/member.png', uses: ['homepage'], size: 4, contentType: 'image/png',
    });
    await setDoc(doc(db, 'media/exact-upload'), {
      state: 'uploading', path: 'media/members/exact-upload/member.png', size: 4, contentType: 'image/png',
    });
    await setDoc(doc(db, 'media/path-check'), {
      state: 'uploading', path: 'media/members/path-check/member.png', size: 4, contentType: 'image/png',
    });
    await setDoc(doc(db, 'media/metadata-check'), {
      state: 'uploading', path: 'media/members/metadata-check/file.png', size: 4, contentType: 'image/png',
    });
  });
});

after(async () => { if (env) await env.cleanup(); });

const run = (name, fn) => test(name, { skip: !enabled }, fn);
const member = (uid, emailVerified = true) => env.authenticatedContext(uid, {
  email: `${uid}@example.org`, email_verified: emailVerified,
});
const admin = (emailVerified = true) => member(adminUid, emailVerified);
const storageFile = (context, path) => context.storage().ref(path);
const bytes = new Uint8Array([1, 2, 3, 4]);

run('public reads stay available while member and approved-member reads enforce their stated scope', async () => {
  await assertSucceeds(storageFile(env.unauthenticatedContext(), 'media/public/public-image/hero.png').getMetadata());
  await assertFails(storageFile(env.unauthenticatedContext(), 'media/members/shared-image/member.png').getMetadata());
  await assertSucceeds(storageFile(member('ordinary-member'), 'media/members/shared-image/member.png').getMetadata());

  await assertFails(storageFile(member('pending-member'), 'media/approved_members/approved-image/member.png').getMetadata());
  await assertSucceeds(storageFile(member('approved-member'), 'media/approved_members/approved-image/member.png').getMetadata());
  await assertFails(storageFile(member('unverified-member', false), 'media/members/shared-image/member.png').getMetadata());
});

run('unknown private scopes and unmatched paths deny non-admin access', async () => {
  await assertFails(storageFile(member('ordinary-member'), 'media/private/private-image/secret.png').getMetadata());
  await assertFails(storageFile(member('ordinary-member'), 'media/members/shared-image/member.png/extra').getMetadata());
});

run('uploads require the verified configured admin and an exact Firestore record, path, size, and content type', async () => {
  const path = 'media/members/exact-upload/member.png';
  await assertFails(storageFile(member('ordinary-member'), path).put(bytes, { contentType: 'image/png' }));
  await assertFails(storageFile(admin(false), path).put(bytes, { contentType: 'image/png' }));
  await assertSucceeds(storageFile(admin(), path).put(bytes, { contentType: 'image/png' }));

  await assertFails(storageFile(admin(), 'media/members/path-check/renamed.png').put(bytes, { contentType: 'image/png' }));
  await assertFails(storageFile(admin(), 'media/public/path-check/member.png').put(bytes, { contentType: 'image/png' }));
  await assertFails(storageFile(admin(), 'media/members/metadata-check/file.png').put(bytes, { contentType: 'text/plain' }));
  await assertFails(storageFile(admin(), 'media/members/metadata-check/file.png').put(new Uint8Array([1, 2, 3]), { contentType: 'image/png' }));
  await assertFails(storageFile(admin(), 'media/members/unrecorded/file.png').put(bytes, { contentType: 'image/png' }));
});

run('list and metadata update are denied, and delete requires an unused deleting record', async () => {
  const memberStore = member('ordinary-member');
  const adminStore = admin();
  await assertFails(memberStore.storage().ref('media/members').listAll());
  await assertFails(adminStore.storage().ref('media/members').listAll());
  await assertFails(storageFile(adminStore, 'media/members/shared-image/member.png').updateMetadata({
    customMetadata: { changed: 'true' },
  }));

  await assertFails(storageFile(memberStore, 'media/members/delete-ready/member.png').delete());
  await assertFails(storageFile(adminStore, 'media/members/in-use/member.png').delete());
  await assertSucceeds(storageFile(adminStore, 'media/members/delete-ready/member.png').delete());
});
