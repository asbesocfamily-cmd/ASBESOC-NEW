import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import worker, { signature, assetPath } from "./worker.mjs";

const env = {
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_API_KEY: "test-key",
  CLOUDINARY_API_SECRET: "test-secret",
  FIREBASE_API_KEY: "firebase-key",
  FIREBASE_PROJECT_ID: "demo-asbesoc-test",
  ADMIN_UID: "admin",
  ALLOWED_ORIGINS: "https://asbesoc.org",
};
const id = "abcdefghijklmnopqrst";
const path = `media/members/${id}/poster.png`;
function fields(state = "uploading", scope = "members", uses = []) {
  return {
    path: { stringValue: `media/${scope}/${id}/poster.png` },
    provider: { stringValue: "cloudinary" },
    scope: { stringValue: scope },
    state: { stringValue: state },
    kind: { stringValue: "image" },
    size: { integerValue: "512" },
    contentType: { stringValue: "image/png" },
    uses: { arrayValue: { values: uses } },
  };
}
function request(
  route,
  {
    token = "admin",
    origin = "https://asbesoc.org",
    body,
    method = body ? "POST" : "GET",
  } = {},
) {
  return new Request("https://media.example" + route, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(origin ? { Origin: origin } : {}),
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
async function mocked(
  fn,
  {
    uid = "admin",
    verified = true,
    state = "uploading",
    scope = "members",
    uses = [],
    approved = true,
    cloudResult = "ok",
    invalidToken = false,
  } = {},
) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("identitytoolkit"))
      return invalidToken
        ? Response.json({}, { status: 400 })
        : Response.json({ users: [{ localId: uid, emailVerified: verified }] });
    if (String(url).includes("/documents/media/"))
      return Response.json({ fields: fields(state, scope, uses) });
    if (String(url).includes("/documents/membershipApplications/"))
      return Response.json({
        fields: { status: { stringValue: approved ? "approved" : "pending" } },
      });
    if (String(url).endsWith("/destroy"))
      return Response.json({ result: cloudResult });
    if (String(url).startsWith("https://res.cloudinary.com/"))
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { "Content-Type": "image/png" },
      });
    throw new Error("Unexpected request " + url);
  };
  try {
    await fn(calls);
  } finally {
    globalThis.fetch = original;
  }
}
test("Cloudinary signature matches independently calculated sorted SHA-256", async () => {
  assert.equal(
    await signature(
      { type: "authenticated", timestamp: 123, public_id: "a" },
      "secret",
    ),
    createHash("sha256")
      .update("public_id=a&timestamp=123&type=authenticatedsecret")
      .digest("hex"),
  );
});
test("paths reject traversal and foreign folders", () => {
  for (const value of [
    "../other",
    `media/members/${id}/..`,
    "media/public/a/x",
    `media/admin/${id}/x`,
  ])
    assert.throws(() => assetPath(value));
  assert.equal(assetPath(path).publicId, `asbesoc/media/members/${id}/asset`);
});
test("rejects unknown origins and handles preflight without upstream calls", async () =>
  mocked(async (calls) => {
    assert.equal(
      (
        await worker.fetch(
          request("/sign-upload", {
            origin: "https://evil.test",
            body: { path },
          }),
          env,
        )
      ).status,
      403,
    );
    const preflight = await worker.fetch(
      request("/sign-upload", { method: "OPTIONS", token: "" }),
      env,
    );
    assert.equal(preflight.status, 204);
    assert.equal(
      preflight.headers.get("Access-Control-Allow-Origin"),
      "https://asbesoc.org",
    );
    assert.equal(calls.length, 0);
  }));
test("missing token, invalid token and unverified users fail closed", async () => {
  assert.equal(
    (
      await worker.fetch(
        request("/sign-upload", { token: "", body: { path } }),
        env,
      )
    ).status,
    401,
  );
  await mocked(
    async () =>
      assert.equal(
        (await worker.fetch(request("/sign-upload", { body: { path } }), env))
          .status,
        401,
      ),
    { invalidToken: true },
  );
  await mocked(
    async () =>
      assert.equal(
        (await worker.fetch(request("/sign-upload", { body: { path } }), env))
          .status,
        403,
      ),
    { verified: false },
  );
});
test("members cannot upload or delete, including forged administrator request fields", async () =>
  mocked(
    async (calls) => {
      for (const route of ["/sign-upload", "/delete"])
        assert.equal(
          (
            await worker.fetch(
              request(route, { body: { path, uid: "admin" } }),
              env,
            )
          ).status,
          403,
        );
      assert.equal(calls.filter((c) => c.url.includes("cloudinary")).length, 0);
    },
    { uid: "member" },
  ));
test("admin upload signature fixes resource identity, privacy and overwrite behavior", async () =>
  mocked(async () => {
    const response = await worker.fetch(
      request("/sign-upload", {
        body: { path, type: "upload", public_id: "foreign" },
      }),
      env,
    );
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.params.type, "authenticated");
    assert.equal(result.params.overwrite, false);
    assert.equal(result.params.public_id, `asbesoc/media/members/${id}/asset`);
    assert.ok(!JSON.stringify(result).includes(env.CLOUDINARY_API_SECRET));
  }));
test("stale media cannot be signed and public files use upload delivery", async () => {
  await mocked(
    async () =>
      assert.equal(
        (await worker.fetch(request("/sign-upload", { body: { path } }), env))
          .status,
        409,
      ),
    { state: "ready" },
  );
  await mocked(
    async () => {
      const r = await worker.fetch(
        request("/sign-upload", {
          body: { path: path.replace("/members/", "/public/") },
        }),
        env,
      );
      assert.equal((await r.json()).params.type, "upload");
    },
    { scope: "public" },
  );
});
test("deletion requires a deletion lock and no saved references", async () => {
  await mocked(async () =>
    assert.equal(
      (await worker.fetch(request("/delete", { body: { path } }), env)).status,
      409,
    ),
  );
  await mocked(
    async (calls) => {
      assert.equal(
        (await worker.fetch(request("/delete", { body: { path } }), env))
          .status,
        409,
      );
      assert.equal(calls.filter((c) => c.url.endsWith("/destroy")).length, 0);
    },
    { state: "deleting", uses: [{ stringValue: "memberFeed/post" }] },
  );
  await mocked(
    async (calls) => {
      assert.equal(
        (await worker.fetch(request("/delete", { body: { path } }), env))
          .status,
        200,
      );
      assert.equal(calls.at(-1).init.body.get("invalidate"), "true");
    },
    { state: "deleting" },
  );
  await mocked(
    async () =>
      assert.equal(
        (await worker.fetch(request("/delete", { body: { path } }), env))
          .status,
        502,
      ),
    { state: "deleting", cloudResult: "error" },
  );
});
test("verified members receive image bytes, never a reusable signed URL", async () =>
  mocked(
    async (calls) => {
      const response = await worker.fetch(
        request("/asset?path=" + encodeURIComponent(path)),
        env,
      );
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("Cache-Control"), "private, no-store");
      assert.equal(response.headers.get("Location"), null);
      assert.deepEqual(
        [...new Uint8Array(await response.arrayBuffer())],
        [1, 2, 3],
      );
      assert.match(
        calls.at(-1).url,
        /image\/authenticated\/s--[A-Za-z0-9_-]{8}--\//,
      );
    },
    { uid: "member" },
  ));
test("approved-member files recheck approval, and regular member files do not require it", async () => {
  const url =
    "/asset?path=" +
    encodeURIComponent(path.replace("/members/", "/approved_members/"));
  await mocked(
    async (calls) => {
      assert.equal((await worker.fetch(request(url), env)).status, 403);
      assert.equal(calls.filter((c) => c.url.includes("cloudinary")).length, 0);
    },
    { uid: "member", approved: false },
  );
  await mocked(
    async () =>
      assert.equal((await worker.fetch(request(url), env)).status, 200),
    { uid: "member", approved: true },
  );
});
test("missing Cloudinary setup produces an actionable error without upstream calls", async () =>
  mocked(async (calls) => {
    const r = await worker.fetch(request("/sign-upload", { body: { path } }), {
      ...env,
      CLOUDINARY_API_SECRET: "",
    });
    assert.equal(r.status, 503);
    assert.match((await r.json()).error, /setup/);
    assert.equal(calls.length, 0);
  }));
