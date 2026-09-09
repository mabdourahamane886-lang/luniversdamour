import { handlePreflight, fail, ok, readJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;

  if (request.method === "GET") {
    return ok(response, {
      storage: "local",
      conversations: [],
      hint: "L’historique invité est stocké dans le navigateur (amourAIConversations)."
    });
  }

  if (request.method === "POST") {
    const body = await readJson(request).catch(() => ({}));
    return ok(response, {
      storage: "local",
      accepted: true,
      title: body.title || "Nouvelle conversation"
    });
  }

  if (request.method === "DELETE") {
    return ok(response, { storage: "local", deleted: true });
  }

  return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
}
