# Membership dashboard rollout

## Implemented locally

Dashboard overview, profile editing, account settings, account-owned membership submission, live application status, administrator review, and atomic review records. Inbox and Notifications are clearly marked as unavailable pending the messaging stage. There is no Trainings route or menu, and no payment or certified-member entitlement is granted by approval.

New applications use `membershipApplications/{auth.uid}`. A transaction refuses an existing record, while the rules disallow applicant updates/deletes and arbitrary document IDs. Duplicate prevention therefore survives reloads and concurrent submissions once these rules are deployed. Profile editing does not alter submitted applications.

## Before production release

1. Export/back up the currently published Firestore rules. Compare them with this candidate; these local rules have not been deployed or validated against the live project.
2. Run Firestore emulator tests covering anonymous support/partnership creates, ownership isolation, duplicate creation, verified-email requirements, protected profile fields, admin-only review and atomic review history. No production data is needed for these tests.
3. Confirm the existing administrator account's UID matches both the rules and `src/firebase/membership.ts`, and its email is verified. The existing UID allowlist remains the current admin model; self-assigned roles are not accepted.
4. Resolve legacy applications as below. Verify rule limits against the current public forms.
5. Deploy reviewed rules to `asbesoc-nigeria` before publishing the dependent frontend. GitHub Pages deployment does not deploy Firestore rules. No Firebase Hosting migration is required.
6. Test real sign-in, profile saving, first submission, concurrent duplicate attempts, review and status updates with designated test accounts. Check direct nested-route loading on GitHub Pages; SPA fallback still needs verification.
7. Commit/push only the tested stage. Git metadata writes have previously been denied on this machine; do not claim a commit or deployment unless confirmed.

## Legacy applications

Existing random-ID submissions are preserved and remain visible to administrators. The frontend does not infer ownership from a matching email address. After verifying the person's identity and account UID, an administrator must use a trusted migration process (Admin SDK or console): check for an existing UID application, copy the verified record to that UID with the correct `userId`, translate `new` to `pending`, retain an audit reference to the original, and mark/archive the original through the migration process. Do not overwrite a UID record or delete original records automatically. Handle collisions manually. This migration tool is not yet implemented.

Legacy applicants are instructed to contact ASBESOC rather than resubmit. Duplicate prevention guarantees one new UID application per account; it does not automatically detect unrelated historical records or multiple accounts belonging to one person.

## Business decisions still pending

Certificate price, payment method/provider, confirmation procedure, certificate validity/renewal and issuance/signatory rules. Approved applicants remain applicants until payment confirmation and certificate issuance are implemented. Certified-only announcement authorization belongs to the messaging/entitlement stage.
