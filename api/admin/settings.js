import { handlePreflight, fail, ok, readJson, requireAdmin } from "../_lib/http.js";
import { PROMPT_VERSION } from "../../src/ai/prompts.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (!requireAdmin(request)) {
    return fail(response, 403, "FORBIDDEN", "Accès admin refusé.");
  }
  if (request.method === "GET") {
    return ok(response, { promptVersion: PROMPT_VERSION, premiumEnabled: false });
  }
  if (request.method === "PATCH") {
    const body = await readJson(request).catch(() => ({}));
    return ok(response, { accepted: false, reason: "Pas de base persistante", receivedKeys: Object.keys(body) });
  }
  return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
}
