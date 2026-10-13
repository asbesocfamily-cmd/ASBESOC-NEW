const host = process.env.FIRESTORE_EMULATOR_HOST || '';
if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {
  throw new Error('Start the local Firestore emulator with project demo-asbesoc-membership before running security tests.');
}
await import('./firestore.rules.test.js');
