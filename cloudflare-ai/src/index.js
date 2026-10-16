const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  return allowedOrigins.has(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Vary": "Origin",
      }
    : { "Vary": "Origin" };
}
import { verifyFirebaseToken } from "./auth/verifyFirebaseToken.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/chat" && request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        service: "ASBESOC AI",
        status: "online",
        version: "1.0.0",
      });
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      let member;

      try {
        member = await verifyFirebaseToken(request, env);
      } catch {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders(request) } });
      }

      return new Response(JSON.stringify({ error: "AI chat is not enabled yet.", authenticated: true }), { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders(request) } });
    }

    return json({ error: "Not found" }, 404);
  },
};

