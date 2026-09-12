const rateBuckets = new Map();

export function applySecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Permissions-Policy", "microphone=(self), camera=()");
}

export function applyCors(request, response) {
  const allowed = process.env.APP_URL || "";
  const origin = request.headers.origin;
  if (allowed && origin && origin.replace(/\/$/, "") === allowed.replace(/\/$/, "")) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    response.setHeader("Access-Control-Allow-Origin", "*");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-token");
}

export function json(response, status, body) {
  applySecurityHeaders(response);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  return response.status(status).json(body);
}

export function fail(response, status, code, message) {
  return json(response, status, { error: { code, message } });
}

export function ok(response, data) {
  return json(response, 200, { success: true, data });
}

export async function readJson(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }
  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }
  return {};
}

export function clientId(request) {
  const forwarded = request.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "").split(",")[0];
  return (ip || request.socket?.remoteAddress || "guest").trim() || "guest";
}

export function rateLimit(request, limit = 300, windowMs = 60 * 60 * 1000) {
  // Backward compatibility: api/chat.js previously passed 40 as its hourly limit.
  // Keep that call safe while raising the actual AI hourly capacity to 300.
  const effectiveLimit = limit === 40 ? 300 : limit;
  const id = clientId(request);
  const now = Date.now();
  const item = rateBuckets.get(id) || { count: 0, start: now };
  if (now - item.start > windowMs) {
    item.count = 0;
    item.start = now;
  }
  item.count += 1;
  rateBuckets.set(id, item);
  return item.count <= effectiveLimit;
}

export function requireAdmin(request) {
  const token = request.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || token !== expected) {
    return false;
  }
  return true;
}

export function handlePreflight(request, response) {
  applyCors(request, response);
  applySecurityHeaders(response);
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return true;
  }
  return false;
}
