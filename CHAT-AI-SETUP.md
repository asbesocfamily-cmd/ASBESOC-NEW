# Miss Chididmma support assistant

The existing member chat remains the interface and source of conversation history. Firebase Functions load the member’s own thread, then call the Cloudflare AI Worker through a signed server-to-server bridge. Gemini credentials and the bridge secret are never part of the website bundle.

## Required configuration

- Set Firebase Functions secret `AI_BRIDGE_SECRET` and Cloudflare Worker secret `AI_BRIDGE_SECRET` to the same randomly generated value. Never put it in source control, Vite variables, browser configuration, or logs.
- Set Cloudflare Worker secret `GEMINI_API_KEY` using the provider key. Never publish its value.
- The Worker’s `AI_ENABLED` variable defaults to `false`. Keep it false until the service is configured and verified in the intended environment.
- Configure Firestore document `systemConfig/supportAI` with `enabled`, `workerUrl` (the HTTPS URL ending in `/internal/reply`), and a short `verifiedContext` containing approved public ASBESOC information only. Do not place private member data or secrets in this context.
- Deploy the existing Functions and Worker only through the approved release process. This setup guide does not claim either deployment is currently configured or live.

## Conversation behavior

The assistant introduces itself once per conversation. A thread in `active` or `resolved` state does not receive AI replies. An administrator reply or status change advances the thread epoch, invalidating a response already being generated. When an administrator releases a thread back to `waiting`, the AI may respond to the latest member message. Members have no bot-takeover control; the admin inbox owns that availability decision.

Provider errors, invalid replies, missing/invalid Worker URLs, and timeouts use the existing system fallback and mark the thread for administrator follow-up. The Worker accepts only a signed internal request and returns structured response data. Chat access remains scoped by the existing member/admin Firestore rules.

## Local verification

Run the Cloudflare AI Worker tests with `node --test worker.test.mjs` from `cloudflare-ai/`. Firebase chat lifecycle, failure fallback, privacy isolation, introduction, and takeover tests are in `functions/test/server.integration.test.js`; they require the already available Firestore emulator configuration. Do not install or download an emulator merely to run them.
