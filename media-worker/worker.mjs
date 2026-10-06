// Secrets live in the Worker, never in the Vite bundle. No service-account key:
// Firestore requests use the caller's token and remain subject to its rules.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message);
};
const timestamp = () => Math.floor(Date.now() / 1000);
const json = (data, status = 200) => Response.json(data, { status });
export async function signature(params, secret) {
  const value =
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&") + secret;
  const bytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
export function assetPath(path) {
  if (typeof path !== "string") fail(400, "Invalid media path.");
  const match =
    /^media\/(public|members|approved_members)\/([A-Za-z0-9]{20})\/([A-Za-z0-9._-]{1,120})$/.exec(
      path,
    );
  if (!match || match[3] === "." || match[3] === "..")
    fail(400, "Invalid media path.");
  return {
    scope: match[1],
    id: match[2],
    publicId: `asbesoc/media/${match[1]}/${match[2]}/asset`,
  };
}
async function authenticate(request, env) {
  const token = request.headers
    .get("Authorization")
    ?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) fail(401, "Please sign in again.");
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    },
  );
  if (!response.ok)
    fail(
      response.status >= 500 ? 503 : 401,
      "Your login could not be verified. Please try signing in again.",
    );
  const user = (await response.json()).users?.[0];
  if (!user?.localId || user.disabled || !user.emailVerified)
    fail(403, "A verified account is required.");
  return { token, uid: user.localId, admin: user.localId === env.ADMIN_UID };
}
async function document(env, user, collection, id) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${user.token}` },
    },
  );
  if (!response.ok)
    fail(
      response.status === 404 ? 404 : 403,
      "This record is unavailable for your account.",
    );
  return (await response.json()).fields || {};
}
async function adminAsset(env, user, path, state) {
  if (!user.admin) fail(403, "Administrator access is required.");
  const parsed = assetPath(path);
  const fields = await document(env, user, "media", parsed.id);
  if (
    fields.path?.stringValue !== path ||
    fields.scope?.stringValue !== parsed.scope ||
    fields.provider?.stringValue !== "cloudinary" ||
    fields.state?.stringValue !== state
  )
    fail(409, "Media changed. Reload the library and try again.");
  if (state === "deleting" && (fields.uses?.arrayValue?.values || []).length)
    fail(409, "Remove saved content references before deleting this file.");
  const kind = fields.kind?.stringValue;
  if (
    !["image", "video"].includes(kind) ||
    (kind === "video" && parsed.scope !== "public")
  )
    fail(400, "Unsupported media type.");
  const size = Number(fields.size?.integerValue);
  const contentType = fields.contentType?.stringValue;
  const allowed =
    kind === "video"
      ? ["video/mp4", "video/webm"]
      : ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (
    !allowed.includes(contentType) ||
    !Number.isSafeInteger(size) ||
    size <= 0 ||
    size > (kind === "video" ? 100 : 10) * 1024 * 1024
  )
    fail(400, "Unsupported file or file too large.");
  return {
    ...parsed,
    kind,
    type: parsed.scope === "public" ? "upload" : "authenticated",
  };
}
async function route(request, env) {
  const url = new URL(request.url);
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  )
    fail(
      503,
      "Media setup is not complete. Connect the Cloudinary account first.",
    );
  if (!/^[a-zA-Z0-9_-]+$/.test(env.CLOUDINARY_CLOUD_NAME))
    fail(503, "Invalid Cloudinary configuration.");
  const user = await authenticate(request, env);
  if (
    request.method === "POST" &&
    ["/sign-upload", "/delete"].includes(url.pathname)
  ) {
    if (!user.admin) fail(403, "Administrator access is required.");
    const raw = await request.text();
    if (raw.length > 2048) fail(413, "Request too large.");
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      fail(400, "Invalid request.");
    }
    const asset = await adminAsset(
      env,
      user,
      body?.path,
      url.pathname === "/delete" ? "deleting" : "uploading",
    );
    const params = {
      public_id: asset.publicId,
      timestamp: timestamp(),
      type: asset.type,
    };
    if (url.pathname === "/sign-upload") {
      Object.assign(params, {
        overwrite: false,
        allowed_formats:
          asset.kind === "video" ? "mp4,webm" : "jpg,jpeg,png,webp,gif,avif",
      });
      return json({
        endpoint: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${asset.kind}/upload`,
        params: {
          ...params,
          api_key: env.CLOUDINARY_API_KEY,
          signature: await signature(params, env.CLOUDINARY_API_SECRET),
        },
      });
    }
    Object.assign(params, { invalidate: true });
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${asset.kind}/destroy`,
      {
        method: "POST",
        body: new URLSearchParams({
          ...params,
          api_key: env.CLOUDINARY_API_KEY,
          signature: await signature(params, env.CLOUDINARY_API_SECRET),
        }),
      },
    );
    const result = await response.json();
    if (!response.ok || !["ok", "not found"].includes(result.result))
      fail(502, "Cloudinary could not delete this file. Please retry.");
    return json({ deleted: true });
  }
  if (request.method === "GET" && url.pathname === "/asset") {
    const asset = assetPath(url.searchParams.get("path"));
    if (asset.scope === "public")
      fail(400, "Public files use their public media URL.");
    if (asset.scope === "approved_members" && !user.admin) {
      const application = await document(
        env,
        user,
        "membershipApplications",
        user.uid,
      );
      if (application.status?.stringValue !== "approved")
        fail(403, "Approved membership is required.");
    }
    // Never return the signed upstream URL. Each browser download checks login.
    const bytes = new Uint8Array(
      await crypto.subtle.digest(
        "SHA-1",
        new TextEncoder().encode(asset.publicId + env.CLOUDINARY_API_SECRET),
      ),
    );
    const sig = btoa(String.fromCharCode(...bytes))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .slice(0, 8);
    const upstream = await fetch(
      `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/authenticated/s--${sig}--/${asset.publicId}`,
      { redirect: "error" },
    );
    if (!upstream.ok)
      fail(
        upstream.status === 404 ? 404 : 502,
        "The member image could not be loaded.",
      );
    const contentType = upstream.headers.get("Content-Type") || "";
    if (!/^image\/(jpeg|png|webp|gif|avif)(;|$)/i.test(contentType))
      fail(502, "The media service returned an unsupported image.");
    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  fail(404, "Not found.");
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim());
    if (origin && !allowed.includes(origin))
      return json({ error: "Origin not allowed." }, 403);
    let response;
    try {
      response =
        request.method === "OPTIONS"
          ? new Response(null, { status: 204 })
          : await route(request, env);
    } catch (error) {
      response = json(
        {
          error:
            error instanceof HttpError
              ? error.message
              : "Media service temporarily unavailable. Please retry.",
        },
        error instanceof HttpError ? error.status : 503,
      );
    }
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Vary", "Origin");
    headers.set("X-Content-Type-Options", "nosniff");
    if (origin) headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    return new Response(response.body, { status: response.status, headers });
  },
};
