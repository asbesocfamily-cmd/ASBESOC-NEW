# ASBESOC analytics and Miss Chididmma staging runbook

This runbook is for an isolated staging environment. It does not authorize a production change or deployment. Use only the refreshed isolated candidate whose manifest includes the staging configuration files and hunk. Do not deploy the mixed source worktree or the earlier candidate without that staging hunk.

## Inventory from this checkout

- `.firebaserc` has one `default` alias, pointing to the existing project used by this checkout; it has no staging alias. `firebase.json` configures Functions, Firestore rules and Storage rules, but no Hosting block. Remote existence, billing status, deployments and data were not queried or verified.
- `src/firebase/firebaseConfig.ts` previously used the configured Firebase Web App values directly; only the App Check site key was read from Vite environment. This meant a staging build could still connect to the configured non-staging Firebase project. The working tree now supports an explicit, completeness-checked staging config mode while preserving the existing production fallback.
- `.env.local` contains only the media API variable. `.env.example` contains analytics and App Check variable names, not staging values. Never copy production client configuration into a staging build.
- `cloudflare-ai/wrangler.jsonc` is the only active Worker config and has AI disabled. No staging Worker config or deployed Worker identity was found. `cloudflare-ai/.dev.vars` exists but was not read; its contents are not needed for this runbook and must not be copied or printed.
- `.github/workflows/deploy.yml` only runs on pushes to `main`, builds and publishes the entire site snapshot to GitHub Pages, and sets the analytics build flag to false. It does not publish Functions or the AI Worker. Do not use this workflow to create staging.
- The already-exported 20-file candidate does **not** contain the new staging config hunk in `src/firebase/firebaseConfig.ts` or the staging templates. Do not deploy that old candidate unchanged: prepare a refreshed isolated candidate from its manifest, add only this staging config hunk, and preserve the candidate's baseline Firebase storage initialization. Exclude every unrelated source-worktree hunk.
- Added `firebase.staging.json.example` for a Firebase Hosting site/channel in an isolated staging Firebase project, and `cloudflare-ai/wrangler.staging.jsonc.example` as a non-deployable staging Worker template. The Worker template omits `name`, so it cannot be deployed until an owner fills in a staging Worker name and project ID.

## Required owner choices and permissions

Choose and record these outside chat: a unique staging Firebase project ID; an owner-approved Google Cloud billing account if Functions deployment is needed; the staging Worker name; the staging Hosting URL; the verified staging admin account; synthetic member accounts; and who is authorized to store the AI provider and bridge secrets.

- **Google/Firebase:** a Project Creator (or project Owner) to create the isolated project and Firebase project; an owner/billing administrator to link billing if approved; a project Owner for first-time setup. For ongoing Functions deployment, Firebase documents either project Owner or Cloud Functions Admin plus Service Account User. App Check, Authentication, Firestore, secrets and Hosting setup should be performed by a project Owner or narrowly delegated Firebase/Google Cloud roles. Do not grant broad roles permanently just for this test.
- **Cloudflare:** access to the intended account and Editor permission on the new Worker. Deploying a Worker without custom routes needs Workers Scripts write for that account. Changing routes or custom domains additionally needs Workers Routes Write for the affected zone. Secret values require an authorized operator with Worker secret-management permission.
- **GitHub:** repository Admin/Settings access only if the owner later chooses to add a separate staging workflow or inspect the existing Pages variable. No GitHub variable or staging workflow is required for Firebase Hosting staging.
- **Potential charges:** deploying Firebase Functions currently requires the Blaze pay-as-you-go plan; usage, build artifacts and other billable services can incur charges. Create a staging budget/spend alert and obtain explicit billing approval first. Cloudflare Workers may fit the Free plan limits; the current Paid plan has a monthly minimum and provider AI usage can add separate charges. Check current plan/usage in the owner accounts before deploying. No billable resource has been created by this task.

## Create isolated Firebase staging project

1. In Firebase Console, create a new project with an owner-chosen staging ID. Do not select or reuse the existing default project. Do not attach production data. Skip Google Analytics during project creation; ASBESOC uses its own consent-based collector for this feature.
2. Add a Web App in Project settings. Enable only the Authentication sign-in provider used by the current app. Create a Firestore database in the intended region. Keep production Firestore, Auth users, Storage and secrets separate.
3. If the owner approves the billing requirement, link the staging project to the approved billing account. Set budget alerts/spend caps where available before deploying Functions.
4. In App Check, register the staging web app with reCAPTCHA v3 (the client implementation uses `ReCaptchaV3Provider`). Register the staging Hosting hostname in the reCAPTCHA configuration. Start in monitoring mode, validate token metrics, then enforce App Check for the analytics callables in staging only.
5. Create synthetic, verified-email member accounts. The analytics Functions check both `request.auth.uid === ADMIN` (a fixed source constant in `functions/src/analytics.js`) and `request.auth.token.email_verified === true`. To satisfy this without changing authorization, the owner can create a synthetic Auth identity in the isolated staging project with that configured UID and `emailVerified: true`, using the Firebase Admin SDK and a secure staging-only credential workflow. Firebase UIDs are project-scoped: reusing the identifier does not copy or grant access to the production account/data. Do not use an Auth Console “Add user” flow that generates a different UID and expect admin access to work. Never create or edit the identity in the default/production project. Alternatively, approve a separately reviewed staging-specific allowlist change; do not weaken the production check.
6. The current Firestore rules are part of the existing architecture. Have the owner review the candidate’s committed baseline `firestore.rules` before deploying it to the empty staging project. Deploy Firestore rules only; do not deploy Storage rules or unrelated rule-test changes as part of this feature stage.

Set the staging project ID explicitly for every command; do not change `.firebaserc` or run `firebase use` in the shared worktree. Keep this PowerShell guard in the same terminal session as the following Firebase commands. It refuses an empty/placeholder project ID and the one in the local default alias:

```powershell
$env:STAGING_PROJECT_ID = '<owner-selected-staging-project-id>'
function Assert-StagingProject {
  $defaultProjectId = (Get-Content .firebaserc -Raw | ConvertFrom-Json).projects.default
  if ([string]::IsNullOrWhiteSpace($env:STAGING_PROJECT_ID) -or
      $env:STAGING_PROJECT_ID.StartsWith('<') -or
      $env:STAGING_PROJECT_ID -eq $defaultProjectId) {
    throw 'Refusing: select and verify an isolated staging Firebase project first.'
  }
}
firebase projects:list
Assert-StagingProject
```

`firebase projects:list` is read-only; review its output locally and confirm the chosen project in Firebase Console. The following rules deployment changes the selected project's Firestore rules and can affect data access. It is not production-safe if the project ID has not been confirmed:

```powershell
Assert-StagingProject
firebase deploy --only firestore:rules --project $env:STAGING_PROJECT_ID
```

Run the rules deploy only after confirming the selected ID in Firebase Console and reviewing the rules file in the exact candidate. Never run a bare deploy command.

## Build and host the staging website

The client now supports a staging-only Firebase Web App override. Normal builds keep the existing configured Firebase values. Setting `VITE_FIREBASE_CONFIG_MODE=staging` requires all six core staging Web App fields; an incomplete staging configuration throws instead of silently mixing staging and default project values. Measurement ID is optional. The Firebase Web App API key and App Check site key are browser-visible configuration, not server secrets; still keep them out of chat and do not commit local environment files.

1. Copy the candidate into an isolated review/release directory as described in its manifest. Copy `firebase.staging.json.example` there as `firebase.staging.json`. This config contains only Hosting, never Functions or Storage.
2. In that candidate directory, create an untracked local `.env.staging.local` using the values from the staging Web App and reCAPTCHA v3 setup. Required names are listed in `.env.example`. Set `VITE_FIREBASE_CONFIG_MODE=staging` and `VITE_WEBSITE_ANALYTICS_ENABLED=true`. Do not reuse `.env.local`; it includes the normal media API configuration. Keep staging test actions limited to the support and analytics features.
3. Build is local. The following Hosting command changes the live channel of the explicitly selected Firebase project and publishes a public site; it can incur usage charges. Run the target guard first, verify the project ID independently, and proceed only after staging project/billing approval:

```powershell
npm ci
npm run build -- --mode staging
Assert-StagingProject
firebase deploy --config firebase.staging.json --project $env:STAGING_PROJECT_ID
```

This targets the live channel of the **separate staging Firebase project**, not GitHub Pages and not production. Firebase Hosting shows the actual URL in the deployment output/console; record that URL only after deployment succeeds. A preview-channel alternative also deploys a public staging release and may incur Hosting usage; run the same target guard and verify the project first:

```powershell
Assert-StagingProject
firebase hosting:channel:deploy <owner-chosen-channel> --project $env:STAGING_PROJECT_ID --config firebase.staging.json --expires 30d
```

Preview links are public to anyone who has the URL and expire; use synthetic data only.

## Deploy staging Functions and configure collector

From the isolated candidate directory, after project-ID confirmation and billing approval:

```powershell
Push-Location functions
npm ci
Pop-Location
```

The next command creates/updates a secret in the selected Firebase project. It changes staging configuration and can incur secret-storage charges. Do not proceed until the staging project is verified and billing is approved. The prompt is interactive; never pass the value as a command-line argument:

```powershell
Assert-StagingProject
firebase functions:secrets:set AI_BRIDGE_SECRET --project $env:STAGING_PROJECT_ID
```

The next command deploys code and can incur Functions/build usage. It names only analytics and support-chat Functions. Do not deploy all Functions from the dirty source checkout. Run the target guard and independently verify the staging ID first:

```powershell
Assert-StagingProject
firebase deploy --only 'functions:recordWebsiteVisit,functions:websiteAnalyticsReport,functions:configureWebsiteAnalytics,functions:expireWebsiteAnalytics,functions:memberChatAutoReply,functions:memberChatReleased' --project $env:STAGING_PROJECT_ID
```

After App Check is registered and valid tokens are observed, sign in to the staging site with the verified staging admin. In Admin → Visitor Analytics, enable collection and select the approved retention period. This changes the collector setting and writes only to the isolated staging Firestore project. Verify a regular member cannot read reports or change this setting. Do not enable collection in the default/production project.

## Create and deploy a separate staging Worker

1. In Cloudflare Dashboard, select the authorized account and create a Worker with an owner-chosen staging name. Keep it on `workers.dev` initially; do not add production DNS/routes.
2. Copy `cloudflare-ai/wrangler.staging.jsonc.example` to `cloudflare-ai/wrangler.staging.jsonc`. Fill in `name` with the new staging Worker name and replace `FIREBASE_PROJECT_ID` with the isolated staging Firebase project ID. The Worker validates Firebase ID tokens against this project, so this must match the staging Web App and Functions project. Leave `AI_ENABLED` false while configuring. Do not edit the existing `wrangler.jsonc`.
3. Install the already-declared Worker dependencies in the isolated candidate’s `cloudflare-ai` directory if needed. The following command deploys a Worker version and may incur usage charges. Before running it, verify the staging Worker `name` is owner-selected and differs from the existing Worker name in `wrangler.jsonc`; confirm the selected Cloudflare account in Wrangler. Never deploy with the production config:

```powershell
Push-Location cloudflare-ai
npm ci
npx wrangler deploy --config wrangler.staging.jsonc
Pop-Location
```

4. Each `wrangler secret put` changes the selected staging Worker's secret bindings and immediately deploys a new version. This may incur Worker usage. Verify `--config wrangler.staging.jsonc` and the Worker name before each command. Enter the same bridge secret value stored in staging Functions; enter the provider key only in the secure prompt. Never put either value in a config file, environment committed to Git, chat, screenshot or logs:

```powershell
Push-Location cloudflare-ai
npx wrangler secret put AI_BRIDGE_SECRET --config wrangler.staging.jsonc
npx wrangler secret put GEMINI_API_KEY --config wrangler.staging.jsonc
Pop-Location
```

5. Only after the owner confirms both bindings and the staging-only Function secret, change `AI_ENABLED=true` in `wrangler.staging.jsonc` and redeploy with the same explicit config. This activates stage AI and provider usage charges may accrue. Verify the staging Worker name/account again before redeploy. Record the deployed Worker URL from Wrangler. In staging Firestore, configure `systemConfig/supportAI` with `enabled: true`, that staging Worker URL ending in `/internal/reply`, and approved public-only context. This Firestore edit changes staging behavior; keep production support configuration unchanged.

## Staging verification checklist

Record the date, candidate base/hash, staging project ID, Hosting URL, Functions deployment identity, Worker name/URL and test account labels. Do not record tokens, secret values or member personal data.

### Analytics and access control

- [ ] Confirm staging site’s Firebase project is the isolated staging project; confirm the analytics build flag is on and App Check initializes with the staging site key.
- [ ] Open as a synthetic member. Before consent, verify no analytics callable is sent. Accept consent, visit two public pages, and verify synthetic page-view/visit counts appear in Admin → Visitor Analytics.
- [ ] Deny consent and then separately withdraw consent. Confirm no subsequent events are submitted and browser identifiers are removed as specified by the privacy UI.
- [ ] Exercise Do Not Track and Global Privacy Control. Confirm collection stays disabled.
- [ ] Complete a synthetic membership application only if the staging application flow is enabled; verify conversion appears only after the save succeeds. Do not submit real membership information.
- [ ] As a verified staging admin, verify report and configuration actions work. As a verified ordinary member and signed-out user, verify report/configuration access is denied. Confirm App Check enforcement rejects a request without a valid staging token.
- [ ] Verify the collector setting is stored only in staging Firestore and is controlled by the staging administrator.

### Miss Chididmma support lifecycle

- [ ] Sign in as synthetic member A. Confirm the introduction appears once in the thread and is not repeated on the next response.
- [ ] Sign in as synthetic member B. Confirm A’s message and context are inaccessible from B’s thread and vice versa.
- [ ] Send a harmless synthetic query. Confirm authenticated Function → signed Worker bridge → AI response succeeds, without exposing provider credentials in browser traffic or logs.
- [ ] Cause a controlled staging-only Worker failure. Confirm the safe fallback is shown and escalated to the administrator inbox.
- [ ] Have an administrator take over while a response is pending. Confirm the stale AI response is not written. Release the thread and verify a new eligible member message can resume AI response.
- [ ] Confirm every Firestore read/write and Worker binding uses staging project/account identifiers; no production member data is present.

### Approval gate before production

- [ ] Attach the staging build/test report and owner-approved exact release diff.
- [ ] Re-run candidate checks after any changes and inspect the Functions/Worker deployment identities.
- [ ] Confirm production analytics flag, App Check, admin access and AI settings remain unchanged until separate explicit production approval.
- [ ] Production GitHub Pages deploys the full website snapshot on a push to `main`; it is not selective and currently builds analytics disabled. Functions and Worker deploy separately. A production release needs separate explicit approval for the exact website workflow change, Functions deployment, Worker deployment, and production settings.

## Cost and official references

Cloud Functions deployment requires Firebase Blaze (linked billing); costs depend on usage and related build/storage services, so the owner must approve billing and set budget alerts/spend caps before staging deployment. There is no deployed Firebase Functions staging path on Spark while retaining this architecture. A cost-aware, no-architecture-change alternative is local unit tests plus an already available Functions/Firestore emulator on a developer machine; it has no cloud Functions deployment charge but is not a public staging environment and cannot prove deployed App Check or external Worker integration. No emulator is available in this environment; do not download one as part of this setup. Cloudflare has a Free Workers plan with limits; its current Paid plan has a monthly minimum, and the AI provider may charge separately. Check current billing/quotas in the account before enabling staging AI.

- [Firebase pricing plans and billing](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
- [Cloud Functions deployment and billing](https://firebase.google.com/docs/functions/)
- [Firebase App Check reCAPTCHA v3](https://firebase.google.com/docs/app-check/web/recaptcha-provider)
- [Firebase Hosting preview channels](https://firebase.google.com/docs/hosting/manage-hosting-resources)
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Worker permissions](https://developers.cloudflare.com/workers/authorization/workers/)
