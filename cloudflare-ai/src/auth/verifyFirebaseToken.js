import { createRemoteJWKSet, jwtVerify } from "jose";

const googleKeys = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export async function verifyFirebaseToken(request, env) {
  const authorization = request.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Missing authentication token");
  }

  const token = authorization.slice(7).trim();
  const projectId = env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("Firebase project is not configured");
  }

  const { payload } = await jwtVerify(token, googleKeys, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });

  if (
    !payload.sub ||
    typeof payload.sub !== "string" ||
    payload.sub.length > 128 ||
    typeof payload.auth_time !== "number" ||
    payload.auth_time > Date.now() / 1000 ||
    !payload.user_id ||
    payload.user_id !== payload.sub
  ) {
    throw new Error("Invalid Firebase authentication token");
  }

  return {
    uid: payload.sub,
    email: payload.email || null,
    emailVerified: payload.email_verified === true,
  };
}
