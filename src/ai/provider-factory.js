import { AI_TIMEOUT_DEFAULT, MAX_OUTPUT_TOKENS_DEFAULT } from "../shared/constants.js";
import { GeminiProvider } from "./providers/gemini.js";
import { OpenAICompatibleProvider } from "./providers/openai.js";
import { AmourCoreProvider } from "./providers/amour-core.js";

function envInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createProviders() {
  const timeoutMs = envInt("AI_TIMEOUT_MS", AI_TIMEOUT_DEFAULT);
  const maxOutputTokens = envInt("AI_MAX_OUTPUT_TOKENS", MAX_OUTPUT_TOKENS_DEFAULT);
  const mode = String(process.env.AMOUR_AI_MODE || "hybrid").toLowerCase();
  const primaryKey = process.env.AI_PRIMARY_API_KEY || process.env.GEMINI_API_KEY;
  const secondaryKey = process.env.AI_SECONDARY_API_KEY || process.env.OPENAI_API_KEY;
  const primaryModel = process.env.AI_PRIMARY_MODEL || process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const compatBaseUrl = process.env.AI_COMPAT_BASE_URL || "https://router.huggingface.co/v1";
  const compatKey = process.env.AI_COMPAT_API_KEY || process.env.HF_TOKEN || secondaryKey;
  const compatModel = process.env.AI_COMPAT_MODEL || "openai/gpt-oss-120b:fastest";
  const secondaryModel = process.env.AI_SECONDARY_MODEL || compatModel;

  const local = new AmourCoreProvider();
  const primary = primaryKey
    ? new GeminiProvider({ apiKey: primaryKey, model: primaryModel, timeoutMs, maxOutputTokens })
    : null;
  const compatible = compatKey
    ? new OpenAICompatibleProvider({
        apiKey: compatKey,
        model: compatModel,
        timeoutMs,
        maxOutputTokens,
        baseUrl: compatBaseUrl
      })
    : null;

  if (mode === "local") return { providers: [local], local };
  if (mode === "compat") return { providers: [compatible, local].filter(Boolean), local };
  if (mode === "gemini") return { providers: [primary, local].filter(Boolean), local };
  return { providers: [local, compatible, primary].filter(Boolean), local };
}

export async function generateWithFallback({ systemPrompt, messages, knowledge }) {
  const { providers, local } = createProviders();
  if (!providers.length) {
    const error = new Error("NO_PROVIDER");
    error.status = 503;
    throw error;
  }

  const errors = [];
  for (const provider of providers) {
    try {
      return await provider.generateText({ systemPrompt, messages, knowledge });
    } catch (error) {
      errors.push(provider.name);
      console.error("provider_fallback", provider.name, error.message);
    }
  }

  return {
    text: local.fallbackText(),
    provider: local.name,
    model: "amour-core-v1",
    fallback: true,
    tried: errors
  };
}
