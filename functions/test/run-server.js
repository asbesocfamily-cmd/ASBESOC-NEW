if (!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || ''))
  throw new Error('Server integration tests require the localhost Firestore emulator.');
process.env.GCLOUD_PROJECT = 'demo-asbesoc-membership';
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });
process.env.PAYSTACK_SECRET_KEY = 'sk_test_local_fixture_not_a_real_key';
await import('./server.integration.test.js');
