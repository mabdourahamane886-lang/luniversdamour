import { handlePreflight, fail, ok, readJson, rateLimit } from "./_lib/http.js";
import { runGeneration } from "../src/services/conversation-service.js";
import { sanitizeText } from "../src/shared/validation.js";
import { AppError } from "../src/shared/errors.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (request.method !== "POST") {
    return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
  }
  if (!rateLimit(request, 30)) {
    return fail(response, 429, "RATE_LIMIT", "Trop de requêtes.");
  }

  try {
    const payload = await readJson(request);
    const message = sanitizeText(payload.message || payload.text || "");
    const wantReply = Boolean(payload.suggestReply);
    const content = wantReply
      ? `Analyse ce message sans certitude, puis propose une réponse respectueuse :\n\n${message}`
      : `Analyse ce message sans certitude :\n\n${message}`;
    const result = await runGeneration({
      payload: { messages: [{ role: "user", content }] },
      tool: "analyze"
    });
    return ok(response, { analysis: result.text, reply: result.text, provider: result.provider });
  } catch (error) {
    if (error instanceof AppError) {
      return fail(response, error.status, error.code, error.message);
    }
    console.error("analyze_error", error.message);
    return fail(response, 502, "AI_UNAVAILABLE", "Analyse indisponible pour le moment.");
  }
}
