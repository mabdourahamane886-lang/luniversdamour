import { handlePreflight, fail, ok, requireAdmin } from "../_lib/http.js";
import { PROMPT_VERSION } from "../../src/ai/prompts.js";
import { createProviders } from "../../src/ai/provider-factory.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (!requireAdmin(request)) {
    return fail(response, 403, "FORBIDDEN", "Accès admin refusé.");
  }
  if (request.method !== "GET") {
    return fail(response, 405, "METHOD_NOT_ALLOWED", "GET only");
  }
  const { primary, secondary } = createProviders();
  return ok(response, {
    users: "n/a-local",
    conversations: "n/a-local",
    promptVersion: PROMPT_VERSION,
    primaryConfigured: Boolean(primary),
    secondaryConfigured: Boolean(secondary),
    note: "Les stats précises nécessitent une base. Le rôle admin n’est jamais lu depuis le frontend."
  });
}
