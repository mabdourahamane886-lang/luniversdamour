import chat from "./api/chat.js";
import analyzeMessage from "./api/analyze-message.js";
import conversations from "./api/conversations.js";
import generate from "./api/generate.js";
import health from "./api/health.js";
import image from "./api/image.js";
import me from "./api/me.js";
import quiz from "./api/quiz.js";
import usage from "./api/usage.js";
import adminSettings from "./api/admin/settings.js";
import adminStats from "./api/admin/stats.js";
import adminUsers from "./api/admin/users.js";

const handlers = {
  "/api/chat": chat,
  "/api/chat.js": chat,
  "/api/analyze-message": analyzeMessage,
  "/api/analyze-message.js": analyzeMessage,
  "/api/conversations": conversations,
  "/api/conversations.js": conversations,
  "/api/generate": generate,
  "/api/generate.js": generate,
  "/api/health": health,
  "/api/health.js": health,
  "/api/image": image,
  "/api/image.js": image,
  "/api/me": me,
  "/api/me.js": me,
  "/api/quiz": quiz,
  "/api/quiz.js": quiz,
  "/api/usage": usage,
  "/api/usage.js": usage,
  "/api/admin/settings": adminSettings,
  "/api/admin/settings.js": adminSettings,
  "/api/admin/stats": adminStats,
  "/api/admin/stats.js": adminStats,
  "/api/admin/users": adminUsers,
  "/api/admin/users.js": adminUsers
};

const blockedPrefixes = [
  "/.git",
  "/.github",
  "/.vercel",
  "/api/",
  "/src/",
  "/supabase/",
  "/scripts/"
];

const blockedFiles = new Set([
  "/.env",
  "/.env.example",
  "/.gitignore",
  "/.nvmrc",
  "/.nojekyll",
  "/package.json",
  "/README.md",
  "/server.js",
  "/vercel.json",
  "/wrangler.json",
  "/wrangler.jsonc"
]);

function normalizePathname(pathname) {
  if (pathname === "/") return "/index.html";
  if (pathname === "/amour-ai" || pathname === "/amour-ai/") return "/amour-ai.html";
  if (pathname === "/experience" || pathname === "/experience/") return "/experience.html";
  if (pathname === "/app" || pathname === "/app/") return "/app/index.html";
  return pathname;
}

function requestHeaders(request) {
  const headers = {};
  for (const [key, value] of request.headers.entries()) {
    headers[key.toLowerCase()] = value;
  }
  const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip");
  if (forwarded) headers["x-forwarded-for"] = forwarded;
  return headers;
}

function createNodeLikeRequest(request, bodyText) {
  const headers = requestHeaders(request);
  const url = new URL(request.url);
  return {
    method: request.method,
    headers,
    body: bodyText,
    query: Object.fromEntries(url.searchParams.entries()),
    socket: {
      remoteAddress: request.headers.get("cf-connecting-ip") || ""
    },
    url: request.url
  };
}

function createNodeLikeResponse() {
  let statusCode = 200;
  let finishedBody = null;
  const headers = new Headers();

  const response = {
    setHeader(name, value) {
      headers.set(name, Array.isArray(value) ? value.join(", ") : String(value));
      return response;
    },
    status(code) {
      statusCode = Number(code) || 200;
      return response;
    },
    json(body) {
      headers.set("Content-Type", "application/json; charset=utf-8");
      finishedBody = JSON.stringify(body);
      return response;
    },
    end(body = "") {
      finishedBody = body == null ? "" : body;
      return response;
    },
    getResponse() {
      let body = finishedBody;
      if (body && typeof body !== "string" && !(body instanceof Uint8Array)) {
        body = String(body);
      }
      return new Response(body ?? "", { status: statusCode, headers });
    }
  };

  return response;
}

function isBlocked(pathname) {
  if (blockedFiles.has(pathname)) return true;
  return blockedPrefixes.some((prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix));
}

async function handleApi(request, handler) {
  const bodyText =
    request.method === "GET" || request.method === "HEAD"
      ? ""
      : await request.clone().text();

  const nodeRequest = createNodeLikeRequest(request, bodyText);
  const nodeResponse = createNodeLikeResponse();

  await handler(nodeRequest, nodeResponse);
  return nodeResponse.getResponse();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const apiPath = url.pathname.replace(/\/+$/, "") || "/";

    const handler = handlers[apiPath];
    if (handler) {
      try {
        return await handleApi(request, handler);
      } catch (error) {
        console.error("worker_api_error", apiPath, error);
        return new Response(
          JSON.stringify({
            error: {
              code: "INTERNAL_ERROR",
              message: "Une erreur interne est survenue."
            }
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json; charset=utf-8" }
          }
        );
      }
    }

    const pathname = normalizePathname(url.pathname);

    if (isBlocked(url.pathname) || isBlocked(pathname)) {
      return new Response("Not Found", { status: 404 });
    }

    const assetUrl = new URL(request.url);
    assetUrl.pathname = pathname;

    const assetRequest = new Request(assetUrl.toString(), request);
    const assetResponse = await env.ASSETS.fetch(assetRequest);

    if (assetResponse.status === 404 && pathname === "/index.html") {
      return new Response("L’univers d’amour est momentanément indisponible.", { status: 503 });
    }

    return assetResponse;
  }
};
