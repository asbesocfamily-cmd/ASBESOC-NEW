const host = process.env.FIRESTORE_EMULATOR_HOST || '';
if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {
  throw new Error('A local Firestore emulator is required for rules tests (project demo-asbesoc-membership).');
}
const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '';
if (!/^(127\.0\.0\.1|localhost):\d+$/.test(storageHost)) {
  throw new Error('A local Storage emulator is required for combined Firestore and Storage rules tests.');
}
await import('./firestore.rules.test.js');
await import('./storage.rules.test.js');
