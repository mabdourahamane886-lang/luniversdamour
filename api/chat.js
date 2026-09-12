import { handlePreflight, fail, json, readJson, rateLimit, clientId } from "./_lib/http.js";
import { runGeneration } from "../src/services/conversation-service.js";
import { consumeDailyQuota, getPlanLimits } from "../src/services/plan.js";
import { AppError } from "../src/shared/errors.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (request.method !== "POST") {
    return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
  }
  if (!rateLimit(request, 40)) {
    return fail(response, 429, "RATE_LIMIT", "Quota horaire atteint. Réessayez plus tard.");
  }

  const limits = getPlanLimits({ plan: "free" });
  const quota = consumeDailyQuota(clientId(request), limits.dailyMessages);
  if (!quota.allowed) {
    return fail(response, 429, "DAILY_QUOTA", "Limite quotidienne du plan gratuit atteinte.");
  }

  try {
    const payload = await readJson(request);
    const result = await runGeneration({ payload, tool: payload.tool });
    const data = {
      reply: result.text,
      text: result.text,
      provider: result.provider,
      model: result.model,
      blocked: result.blocked,
      promptVersion: result.promptVersion,
      usage: quota
    };

    // Keep both shapes for compatibility with the current frontend and newer clients.
    return json(response, 200, {
      success: true,
      data,
      reply: result.text,
      text: result.text,
      provider: result.provider,
      model: result.model
    });
  } catch (error) {
    if (error instanceof AppError) {
      return fail(response, error.status, error.code, error.message);
    }
    if (error.message === "NO_PROVIDER") {
      return fail(
        response,
        503,
        "AI_NOT_CONFIGURED",
        "Amour AI n’est pas encore configurée côté serveur."
      );
    }
    console.error("chat_error", error.message);
    return fail(
      response,
      502,
      "AI_UNAVAILABLE",
      "L’assistant est temporairement indisponible. Veuillez réessayer."
    );
  }
}
