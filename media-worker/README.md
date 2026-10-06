# ASBESOC media connection

Cloudinary stores new images/videos. Firebase Auth and Firestore remain unchanged. This Worker authorizes uploads/deletion with the existing verified administrator UID and checks member access before proxying private image bytes. Cloudinary API secrets never enter the browser. No Firebase Storage bucket or Firebase billing upgrade is required for this path.

## Account setup still required

1. Create/select the free Cloudinary product environment. In API Keys, find its cloud name, API key and API secret. Do not paste the secret into chat or a VITE_ variable.
2. Sign in to the existing Cloudflare account. Deploy this directory as the `asbesoc-media` Worker using Wrangler or the Cloudflare dashboard. Keep it on the Workers Free plan. Do not attach it to existing website routes; its own workers.dev address is sufficient.
3. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` as Worker secrets. Non-secret Firebase/project/origin configuration is in wrangler.jsonc. This uses the Firebase Auth REST API; if the Firebase API key has browser-referrer restrictions, use a separate key restricted to the Identity Toolkit API for the Worker.
4. Set `VITE_MEDIA_API_URL=https://asbesoc-media.YOUR-SUBDOMAIN.workers.dev` in the website's local `.env.local`. Restart Vite. Add the same public URL to the production build environment before rebuilding/publishing the website. The frontend example intentionally has no guessed endpoint.
5. Test one intended public image, video, verified-member poster and approved-member poster with the real account before declaring media operational. Confirm that a signed-out browser cannot load a private image and a non-approved member cannot load an approved-only poster. Delete unused test media afterward.

Optional CLI, from this directory (install/run Wrangler separately from app dependencies):

```
npx wrangler login
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
npx wrangler deploy
```

There is no unsigned upload preset. Administrators obtain a signature for the exact Firestore media record, then upload directly to Cloudinary with progress and cancellation. Failed uploads keep a cleanup record; deletion checks the existing transaction lock and saved references, then invalidates Cloudinary CDN copies. Public CDN deletion may take time to propagate.

Member assets use Cloudinary authenticated delivery. The Worker fetches them server-side and returns image bytes with no-store headers. It never sends signed delivery URLs to the browser. Existing Firebase attachments remain readable via the legacy provider; new uploads use Cloudinary. The scope access behavior matches the previous Storage rules: verified-member images require verified login, approved-member images require approved membership.

Image limits remain 10 MiB and public videos 100 MiB in the app; the account's own limits can be lower and are enforced by Cloudinary. Free tiers are usage-limited. This implementation cannot prevent a legitimate member from saving an image already delivered to them.

Run local boundary tests with `node --test worker.test.mjs`. These use mocked external APIs; passing them does not establish that a real Cloudinary account or Worker has been configured.

References: https://cloudinary.com/documentation/client_side_uploading ; https://cloudinary.com/documentation/control_access_to_media ; https://developers.cloudflare.com/workers/platform/limits/
