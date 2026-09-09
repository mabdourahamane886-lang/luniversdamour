import { handlePreflight, fail, ok, readJson, rateLimit, clientId } from "./_lib/http.js";
import { runGeneration } from "../src/services/conversation-service.js";
import { sanitizeText } from "../src/shared/validation.js";
import { consumeDailyQuota, getPlanLimits } from "../src/services/plan.js";
import { AppError } from "../src/shared/errors.js";

const TOOLS = new Set(["message", "poem", "advice", "date", "quiz"]);

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (request.method !== "POST") {
    return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
  }
  if (!rateLimit(request, 30)) {
    return fail(response, 429, "RATE_LIMIT", "Trop de générations. Réessayez plus tard.");
  }

  try {
    const payload = await readJson(request);
    const tool = TOOLS.has(payload.tool) ? payload.tool : "message";
    const prompt = sanitizeText(payload.prompt || payload.message || payload.input || "");
    const quota = consumeDailyQuota(clientId(request), getPlanLimits({ plan: "free" }).dailyMessages);
    if (!quota.allowed) {
      return fail(response, 429, "DAILY_QUOTA", "Limite quotidienne atteinte.");
    }
    const result = await runGeneration({
      payload: { messages: [{ role: "user", content: prompt }] },
      tool
    });
    return ok(response, {
      output: result.text,
      reply: result.text,
      tool,
      provider: result.provider,
      model: result.model
    });
  } catch (error) {
    if (error instanceof AppError) {
      return fail(response, error.status, error.code, error.message);
    }
    console.error("generate_error", error.message);
    return fail(response, 502, "AI_UNAVAILABLE", "Génération indisponible pour le moment.");
  }
}
