import { handlePreflight, ok } from "./_lib/http.js";
import { createProviders } from "../src/ai/provider-factory.js";
import { PROMPT_VERSION } from "../src/ai/prompts.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "GET only" } });
  }

  const { primary, secondary } = createProviders();
  return ok(response, {
    status: "ok",
    promptVersion: PROMPT_VERSION,
    node: process.version,
    timestamp: new Date().toISOString(),
    primaryConfigured: Boolean(primary),
    secondaryConfigured: Boolean(secondary)
  });
}
