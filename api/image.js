import { handlePreflight, fail, json, readJson, rateLimit, clientId } from "./_lib/http.js";

function getKey() {
  return process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "";
}

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (request.method !== "POST") return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
  if (!rateLimit(request, 10)) return fail(response, 429, "RATE_LIMIT", "Trop de demandes. Réessayez plus tard.");
  const key = getKey();
  if (!key) return fail(response, 503, "IMAGE_NOT_CONFIGURED", "La génération d’images n’est pas configurée côté serveur.");
  try {
    const payload = await readJson(request);
    const prompt = String(payload?.prompt || "").trim();
    if (!prompt) return fail(response, 400, "PROMPT_REQUIRED", "Décrivez l’image à créer.");
    if (prompt.length > 2000) return fail(response, 400, "PROMPT_TOO_LONG", "La description est trop longue.");
    const model = String(process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, size: payload?.size || "1024x1024", quality: payload?.quality || "auto", n: 1 })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const message = data?.error?.message || "La génération d’image a échoué.";
      return fail(response, r.status >= 500 ? 502 : r.status, "IMAGE_PROVIDER_ERROR", message);
    }
    const item = data?.data?.[0] || {};
    return json(response, 200, { success: true, data: { url: item.url || null, b64_json: item.b64_json || null, model } });
  } catch (error) {
    console.error("image_error", error?.message || error);
    return fail(response, 502, "IMAGE_UNAVAILABLE", "La génération d’image est temporairement indisponible.");
  }
}
