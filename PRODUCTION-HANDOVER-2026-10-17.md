# ASBESOC implementation and release handover — 17 October 2026

Status: tested local candidate, **not deployed and not yet production-ready**. Existing design and infrastructure retained. The owner confirmed annual pricing of **NGN 5,000 / USD 5** in this session; server minor-unit amounts remain 500000 / 500. Currency availability still requires Paystack merchant verification.

## Existing features before this work

Baseline: commit 4954bd6572f294e09ea1664a4ad82711ac46aa60. The production build and 16 payment policy tests passed before edits. Existing source included signup/login/email verification/password reset, membership applications and atomic reviews, member/admin dashboards, chat/read receipts, CMS/media/gallery, announcements/broadcasts, annual payment verification, signed webhooks, certificates/PDF/QR/public verification, revocation and in-app renewal reminders. These were existing implementations, not proof of live deployment or provider operation. The Gallery still contains 69 bundled photos.

The Firebase payment service was gated off in the frontend workflow. The AI trigger used canned keyword answers, and the Cloudflare endpoint returned a disabled-service response. No visitor analytics implementation was found. Existing user ZIP and dashboard/payment-history backup files were left untouched and excluded from the change set.

## Newly implemented and corrected

### Visitor reporting

- Added consent-based, pseudonymous Firebase reporting inside the existing admin shell: sessions/visits, page views, unique browser estimates, first-time and returning browsers, guest/member sessions, daily charts, device/browser/OS categories, page popularity, navigation pairs, referral hostnames and authenticated signup events.
- Daily/weekly/monthly/all-available filters, UTC date ranges, CSV export, five-minute active-session estimates, explicit sampling limits, and administrator retention/collection settings.
- Route allowlist removes arbitrary paths and query strings; certificate/account identifiers are not captured as page paths. Referral paths/queries, raw browser user-agent strings, passwords, form contents, IP addresses and precise location are not stored in analytics. Browser/session UUIDs are hashed server-side and never identify an anonymous visitor personally.
- Browser consent is optional; declining/withdrawing clears local analytics identifiers. DNT/GPC is respected. Analytics failure does not interrupt membership or navigation.
- App Check on collection/report/config endpoints, explicit verified-administrator checks, default-deny collection rules, session throttling, idempotent event IDs, maximum 90-day retention and scheduled removal. Shortening retention is applied by the deletion job.
- New public privacy page and footer link.

This is a first-party Firebase implementation, not a Cloudflare Web Analytics integration. Location reporting is explicitly unavailable. Reports cover retained records (up to 90 days), not lifetime totals. Counts are limited to consenting browsers, are not people counts, and reports over 20,000 events are explicitly marked incomplete. First-time and returning groups may overlap across a selected range. Guest/member session categories can overlap after sign-in. Signup conversion is a browser-level account-signup signal, not membership approval or paid conversion.

### Miss Chididmma

- Replaced preset replies with an authenticated server-to-server Gemini bridge: the member continues using the existing support chat, without an additional AI button.
- Firebase performs conversation reads/writes using its managed runtime identity. The Worker receives bounded message context and admin-maintained verified facts; it has no Firebase service-account credential and cannot write to Firestore.
- Shared-secret HMAC signatures bind the exact request body and timestamp; invalid/stale signatures fail closed. Gemini API keys stay in Worker secrets. No browser CORS access is offered to the private reply endpoint.
- One transparent automated-support introduction per conversation, persistent context from the last 12 messages, structured escalation, safe provider-error fallback and an administrator-required indicator.
- Deterministic reply IDs, transactional leases, six requests/minute/conversation and final transaction checks prevent duplicate/stale replies. Admin takeover increments an epoch, including takeover followed quickly by release. A release trigger can process the latest unanswered message.
- Admin controls explicitly label takeover and release. Worker and Firestore configuration both default to disabled.

The model is instructed to use only supplied verified facts and escalate sensitive/unresolved issues. This is an instruction-based safeguard, not a guarantee of factual accuracy. Live response quality and escalation behavior still need staging review with the organization's approved knowledge. Provider failures escalate for human help instead of repeatedly charging for retries.

### Membership/payments/certificates

- Kept owner-confirmed NGN 5,000/USD 5 prices and all server-only activation gates.
- Corrected member payment history to read `amountMinor` rather than the nonexistent `amount` field, avoiding false zero amounts. Reset history across account changes without retaining another account's records.
- Added a server-authorized downloadable text receipt for verified paid orders only, accessible to owner/admin. This is a payment acknowledgement, not a tax invoice.
- Server verification now distinguishes pending/failed provider results, validates their order identity, and stores their status without issuing membership or certificates. The frontend no longer displays a success message for a nonconfirmed response.
- Success webhooks request retry if server verification remains pending. Existing exact-byte HMAC-SHA512 verification and atomic receipt/certificate/membership settlement remain intact.
- Durable per-account throttles protect checkout, payment confirmation, receipt and certificate downloads. Public certificate verification now requires App Check (no login required).
- Added a composite index for chat release lookup and retained the backend dependency lock. CI verification now gates the existing Pages deployment, using Node 22 and isolated emulator tests. The existing build can read the public App Check site key from the `FIREBASE_APPCHECK_SITE_KEY` repository variable.

## Tests and results

**65 automated tests passed with no skipped cases:**

| Suite | Passed | Coverage |
| --- | ---: | --- |
| Policy and analytics unit tests | 19 | Fixed prices, identity/amount/currency/domain mismatches, signatures, annual dates, expiry, reminders, minimization, estimates, pending/failed outcomes |
| AI bridge, existing media Worker, existing chat-read tests | 17 | Forged/stale signatures, input bounds, structured provider results/errors, media permissions/signatures, unread semantics |
| Firestore emulator security tests | 16 | Cross-account access, forged entitlements, profile roles, training restrictions, immutable reviews, analytics/config access denial and AI message/control forgery |
| Server/emulator integration tests | 13 | Disabled payments, certificate privacy/download/revocation, reminder deduplication, AI deduplication/introduction/context/takeover race/escalation, analytics idempotency/retention/access, concurrent payment settlement/replay/receipt ownership and durable quotas |

Frontend TypeScript/production builds and ESLint passed. Existing Firebase bundle-size warning remains. Manual browser smoke checks: homepage loads; privacy page is readable at 390×844; Gallery retains 69 photos and its full-screen viewer opens. Authenticated dashboard visual QA, signup email delivery, actual payments, real Gemini responses, touch/swipe interactions and full mobile regression testing are not established by these checks.

The original Firebase CLI emulator command ran the tests successfully but returned an error during shutdown (`Timed out`). `scripts/test-emulator.mjs` launches the official demo Firestore emulator directly, refuses an occupied port, runs the same suites and cleans up its owned process. That runner completed with exit 0. It requires Java 21+ and `FIRESTORE_EMULATOR_JAR`; `JAVA_HOME` is optional when Java is already on PATH. Demo fixtures never touch production. A fake provider response is used only for the explicitly isolated settlement test; no real payment was made.

Cloudflare packaging dry-run did not pass: its bundler could not traverse sandbox-restricted parent directories, including when source was copied to the writable workspace. Worker HTTP unit tests and module execution passed; these do not replace a successful Worker package/deployment check. The new GitHub workflow has not run remotely yet.

## Deployment status

No live deployment, production data write, secret update, payment activation, GitHub push, infrastructure replacement or billing change was performed. Firebase project listing in the selected CLI configuration failed authentication. Wrangler reported no authenticated session. Remote GitHub HEAD was readable and remained 4954bd6572f294e09ea1664a4ad82711ac46aa60 at the access check; write access was not established.

Git could not create the review branch: writing `.git/refs/heads` remains denied in this environment, including after an explicit directory permission grant. The changes remain uncommitted in the existing checkout on `main`; no new commit or branch is claimed. HEAD remains 4954bd6572f294e09ea1664a4ad82711ac46aa60. The exported report contains the file inventory, and a source-change ZIP preserves the work for review. This file does not imply that the new backend or UI is available at asbesoc.org.

## Remaining work and release gates

1. Restore authorized Firebase/Cloudflare CLI access and verify GitHub write access. Confirm the existing Firebase project, admin UID, deployed rules/indexes, hosting setup and billing before any deployment. Back up live rules and review legacy data; there is no automatic migration.
2. Configure Firebase App Check for the website and staging environment. Verify enforcement on actual callable requests, including public certificate lookup. The `.run` integration tests validate handler logic; they do not exercise deployed App Check middleware.
3. Complete actual provider testing in isolated staging: signup/verification email, member application/admin approval, NGN checkout, merchant-supported USD checkout, cancellation/failure, webhook registration, verification retries, certificate downloads/verification, renewal, revocation and reminders. Live-domain enforcement intentionally rejects Paystack test-domain payments in production.
4. Create Worker secrets `GEMINI_API_KEY` and a strong random `AI_BRIDGE_SECRET`; set the matching bridge secret in Firebase Secret Manager. Never put secrets in VITE variables, source, config examples or chat. Verify model availability and the Worker URL; run the Worker package check outside the restricted bundler environment.
5. Configure the server-only `systemConfig/supportAI` document with `enabled:false`, an HTTPS workers.dev URL ending `/internal/reply`, and reviewed `verifiedContext`. Publish backend/indexes and Worker, exercise takeover/release/failure in staging, then enable both server config and Worker flag deliberately.
6. Visitor geography and durable lifetime totals remain unimplemented. If required, select a reviewed analytics provider/edge integration and define its privacy and retention policy before activation. At higher traffic, replace bounded event scans with scalable aggregation and strengthen edge abuse controls; synthetic UUID rotation can evade per-session throttles.
7. Verify analytics App Check, consent, visibility heartbeat, signup tracking, administrator export, retention scheduler and production volume/cost. Configure `systemConfig/analytics` and enable the frontend flag only after deployment and review. Collection is off by default.
8. Training feed documents are membership-gated, but existing external course links/assets can still be shared. Choose a protected course host or implement signed, revocable delivery before claiming that course materials themselves are access-controlled.
9. Automated email/SMS renewal delivery, refund/chargeback processing, overdue payment reconciliation and operational alerting are still incomplete. Existing renewal reminders are in-app. Admin revocation is available for manual account review; do not infer automatic refund handling.
10. Review certificate branding/signatories, public name disclosure, privacy wording, email verification delivery and full authenticated mobile layouts. No claim of legal compliance or complete production certification is made.

## Safe release sequence

Keep `VITE_MEMBERSHIP_SERVICE_ENABLED=false`, `VITE_WEBSITE_ANALYTICS_ENABLED=false`, payment config disabled, support-AI config disabled and Worker `AI_ENABLED=false` until staging gates pass. Deploy reviewed Firebase rules/indexes/functions and disabled Worker first. Verify live configuration and the public site's existing workflow. Enable one integration at a time after its account/provider checks. Firebase functions and a Worker do not deploy merely by pushing GitHub Pages.

Suggested initial server-only documents:

```json
// systemConfig/analytics
{ "enabled": false, "retentionDays": 90 }
// systemConfig/supportAI — replace URL after checking the existing account
{ "enabled": false, "workerUrl": "https://REVIEWED-WORKER.workers.dev/internal/reply", "verifiedContext": "Review and supply approved organizational facts, membership steps and NGN 5,000 / USD 5 pricing. Do not claim that merchant USD acceptance is verified." }
```

Existing `functions/payment-config.example.json` remains disabled. Do not enable currencies that Paystack has not approved for the merchant.

Reproducible commands: `npm run build`; `npm run lint`; `npm --prefix functions ci`; `npm --prefix functions test`; `node --test cloudflare-ai/worker.test.mjs media-worker/worker.test.mjs scripts/chat-read.test.mjs`; set `FIRESTORE_EMULATOR_JAR` (and optionally `JAVA_HOME`), then `node scripts/test-emulator.mjs`.

Provider references reviewed: https://firebase.google.com/docs/firestore/manage-data/transactions ; https://firebase.google.com/docs/functions/firestore-events ; https://ai.google.dev/api/generate-content ; https://paystack.com/docs/payments/verify-payments/ ; https://paystack.com/docs/payments/webhooks/ .
