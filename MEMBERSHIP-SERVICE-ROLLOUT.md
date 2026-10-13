# Annual membership implementation — 10 October 2026

Status: local candidate only. No production data, rules, secrets, memberships, payments or deployments were changed. Payments remain disabled. Cloudinary work is deferred.

## Confirmed policy

- NGN 5,000 (500,000 minor units) or USD 5 (500 minor units), separate fixed prices.
- One calendar year from the start date, with leap-day anniversaries clamped to February 28.
- Initial and lapsed memberships start when server verification issues membership. Early renewals preserve the existing expiry and add one year. Renewal opens 30 days before expiry; this window is an implementation default and may be adjusted before activation.
- Approval does not grant paid or certified status. No mock/test payment can grant a production entitlement.

## Existing project audit

| Area | Evidence and limits |
| --- | --- |
| Repository | Clean initial checkout at de9e1c6; origin is asbesocfamily-cmd/ASBESOC-NEW. Changes in this stage are uncommitted. |
| GitHub deployment | Public GitHub Actions API reports successful run 37929862785 for de9e1c6. Workflow publishes main to GitHub Pages; it does not deploy Firebase rules/functions. Push credentials were not verified. |
| Public site | Homepage returned HTTP 200. Direct Gallery navigation returns an initial 404 but the existing 404.html/sessionStorage fallback successfully opens the Gallery in a real browser. |
| Gallery | Latest commit added filters, video previews and a viewer caption overlay. User approved appearance restoration. These visual additions were removed locally; original grid/full-screen viewer retained. 69 bundled photos visible before/after. Uploaded/CMS data sources remain connected and no files or records were deleted. Live upload reads failed in the local browser; uploaded content availability is not verified. |
| Firebase | Client targets asbesoc-nigeria. Local rules inspected; deployed rules and authenticated end-to-end flows were not verified. Firebase CLI could not access its local configuration. |
| Authentication | Signup, login, email verification and password reset are implemented. Build verified; actual email delivery/sign-in not tested with designated accounts. |
| Applications/admin | Account-owned applications, transactional approval/rejection and review history exist. Local rules limit client approval to unpaid/payment_required. Security emulator checks remain a release gate. |
| Messaging/content | Member/admin chat, broadcasts, posts and admin tools exist. Live send/read/delivery not verified. |
| Training before this stage | Published training content was available to all email-verified accounts. Candidate rules now require a current, unrevoked membership. |
| Payments/certificates before this stage | Disabled payment placeholder and certificate status fields only; no verification backend, PDF generator, annual expiry, renewal service or public verification route. |

## Added locally

- Firebase Functions service: authenticated/App Check-protected checkout, server-side verification, signed webhook verification, atomic order/receipt/membership/certificate issuance, duplicate transaction protection, admin revocation and audit records.
- Checkout prices are chosen on the server; client-supplied amounts are never used. Verification compares live domain, transaction success, reference, amount, currency, account metadata and payer email against the stored order.
- Annual dates and expiry checks; revoked/expired memberships cannot access protected training posts. Applications without expiry fail closed for certified display.
- Unique UUID certificate IDs and on-demand private PDF generation with QR verification link. Public lookup returns name, dates and validity only, never email, address, DOB, UID or payment details. Public certificate collection reads are denied.
- Member annual payment/renewal panel, PDF download and verification route, admin membership/payment table and explicit revocation review form.
- Daily durable in-app reminders for 30 days, 7 days and expiry, deduplicated per certificate/stage. No email/SMS delivery service is connected or used.
- Approved Gallery appearance restoration, retaining the newer content retrieval and stable item identity.

## Validation completed

- Baseline and updated frontend production builds pass. Existing Firebase bundle-size warning remains.
- ESLint passes after correcting the admin expiry clock.
- 16 policy tests pass: activation gates, fixed prices, wrong status/domain/reference/amount/currency/customer/account/time, forged webhook signatures, anniversaries, leap dates, expiry/revocation and reminder thresholds.
- Functions syntax and module loading pass; all seven expected endpoints/jobs export successfully.
- Sample PDF generated without any database writes, rendered with Poppler and visually inspected: one landscape page, readable text and QR, no overlap. Sample is explicitly invalid.
- Browser check: live Gallery route resolves; local restored Gallery retains 69 bundled photos and full-screen viewer; next-image keyboard navigation works.
- Six Firestore emulator security tests are written but have NOT run. Java is not installed and a bounded Java download timed out. Do not represent these tests as passing.

## Remaining release gates

1. Run the Firestore security suite with Java 21+ and the Firebase emulator, including the direct client-write denial tests. Extend emulator coverage to concurrent/replayed settlements, duplicate checkout calls, post-payment revocation, renewal race conditions and scheduler retries. The pure policy tests do not establish transaction integration correctness.
2. Verify the deployed Firestore/storage rules, existing admin UID, legacy application ownership and any historical paid/issued records. There is no automatic migration or deletion. Back up deployed rules before proposing deployment.
3. Exercise authenticated member/admin screens and complete signup → apply → approve using designated test accounts in an isolated staging project. Verify App Check end-to-end.
4. Configure Paystack and confirm merchant support for each currency. USD is a configured price, not a claim that this merchant account accepts USD. Run provider integration tests in a separate test environment; this production service intentionally rejects Paystack test-domain transactions.
5. Review certificate branding/signatories and public name disclosure. The generated certificate currently uses text branding and no signature image.
6. Training feed reads are server-gated; existing external course links/media URLs do not become protected by hiding the feed. A protected training host or signed-resource delivery is still needed for revocable access to externally hosted materials.
7. Review refund/chargeback operations (currently manual admin revocation), overdue/pending payment reconciliation, operational alerting and public verification abuse controls before payment activation.
8. Review reminder scheduling at real membership volume. Email/SMS reminders remain unimplemented; in-app reminders are the current delivery channel.
9. Request explicit user approval for the reviewed deployment. No push to main, rules deployment or payment activation has been performed.

## Reproducible local checks

```powershell
npm run build
npm run lint
npm --prefix functions ci
npm --prefix functions test
npm --prefix functions run check
firebase emulators:exec --project demo-asbesoc-membership --only firestore "npm --prefix functions run test:rules"
```

The dedicated rules command fails without a localhost emulator. Never use production for these fixtures.

## Activation contract (after tests and approval)

Keep VITE_MEMBERSHIP_SERVICE_ENABLED=false until the backend and rules have been reviewed and deployed. Set a valid VITE_FIREBASE_APPCHECK_SITE_KEY in the build only after registering the website with Firebase App Check. Authenticated calls enforce App Check; public certificate lookup does not require login.

PAYSTACK_SECRET_KEY belongs in Firebase Secret Manager, never frontend environment variables or Git. The server-only document systemConfig/payments defaults to unavailable when absent. Its reviewed shape is in functions/payment-config.example.json. Activation requires enabled=true, verificationConfigured=true, annualPolicy=anniversary, a live secret and only merchant-supported entries in enabledCurrencies. Default config has no enabled currencies.

Deploy only after approval, in order: reviewed rules/indexes, functions, staging/provider checks, then frontend activation. GitHub Pages cannot host the server functions; pushing frontend code does not activate them. Firebase billing/region and scheduled-function costs need account verification before deployment.

The public lookup route is /verify-certificate/:id. Private PDF downloads require the owner or existing admin. Reminder documents live at membershipReminders/{uid}/items/{certificateId}-{stage}. Existing legacy certificate URLs are no longer treated as current certified proof without a valid expiry.

Sources used for provider design: https://paystack.com/docs/payments/verify-payments/ and https://paystack.com/docs/payments/webhooks/; Firebase callable functions: https://firebase.google.com/docs/functions/callable.

Deployment evidence: https://github.com/asbesocfamily-cmd/ASBESOC-NEW/actions/runs/37929862785.
