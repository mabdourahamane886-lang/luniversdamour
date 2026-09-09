import { handlePreflight, fail, ok, readJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;

  if (request.method === "GET") {
    return ok(response, { storage: "local", favorites: [] });
  }
  if (request.method === "POST") {
    await readJson(request);
    return ok(response, { storage: "local", saved: true });
  }
  if (request.method === "DELETE") {
    return ok(response, { storage: "local", deleted: true });
  }
  return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
}
