# First-party website analytics setup

ASBESOC currently uses its own consent-based Firebase Functions and Firestore collector. No Cloudflare Web Analytics beacon or third-party analytics provider is configured in the website source. The admin report must therefore be described as ASBESOC first-party measurements, not Cloudflare metrics.

## Enablement

1. Set the non-secret Vite build flag `VITE_WEBSITE_ANALYTICS_ENABLED=true` in the intended build environment. Without it, the consent prompt and client tracking are disabled. This flag is public configuration and must not contain credentials.
2. Deploy the existing Firebase Functions with the normal project release process, including `recordWebsiteVisit`, `websiteAnalyticsReport`, `configureWebsiteAnalytics`, and `expireWebsiteAnalytics`. The report and configuration callables require App Check and an authenticated, verified administrator.
3. Open **Admin → Visitor Analytics** and enable collection with a retention period from 1 to 90 days. Collection remains disabled until this setting is saved.
4. Confirm the consent prompt appears on the public site, accept consent in a test browser, and verify that only aggregate, allowlisted data appears in the admin report. Do not use real member personal information as test analytics data.

No analytics provider API key or IP geolocation integration is required. Country metrics are unavailable by design because this collector does not store IP addresses or perform location lookups. Unique visitors are estimates based on random browser identifiers and require consent and browser storage.

## Data and privacy

Collection is opt-in. Do Not Track and Global Privacy Control are respected. The collector stores allowlisted page categories, random visitor/session hashes, broad device/browser/OS categories, referral hostname, timestamps, and a signed-in boolean. It does not store query strings, form contents, application answers, message text, payment data, IP addresses, or precise locations. Signup and completed-application conversion events are deduplicated by a server-side hash of the authenticated account ID; the raw account ID is not written to analytics records.

Records expire within the configured retention period (maximum 90 days). The scheduled cleanup runs every 24 hours. The browser visitor identifier expires after 90 days and the session identifier is renewed after 30 minutes of inactivity. Reports may be limited to 20,000 events per query and explicitly show when truncated.

The website continues to function when analytics is disabled or unavailable; client tracking failures are intentionally ignored. Admin report and settings failures are shown in the dashboard. No live traffic or deployed configuration is asserted by this document.
