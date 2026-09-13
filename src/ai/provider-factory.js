import { AI_TIMEOUT_DEFAULT, MAX_OUTPUT_TOKENS_DEFAULT } from "../shared/constants.js";
import { GeminiProvider } from "./providers/gemini.js";
import { OpenAICompatibleProvider } from "./providers/openai.js";
import { AmourCoreProvider } from "./providers/amour-core.js";

function envInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function firstEnv(...names) {
  for (const name of names) {
    const value = String(process.env[name] || "").trim();
    if (value) return value;
  }
  return "";
}

export function createProviders() {
  const timeoutMs = envInt("AI_TIMEOUT_MS", AI_TIMEOUT_DEFAULT);
  const maxOutputTokens = envInt("AI_MAX_OUTPUT_TOKENS", MAX_OUTPUT_TOKENS_DEFAULT);
  const configuredMode = String(process.env.AMOUR_AI_MODE || "hybrid").toLowerCase();
  const mode = ["gemini", "local", "compat", "hybrid"].includes(configuredMode)
    ? configuredMode
    : "hybrid";

  const primaryKey = firstEnv(
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY",
    "AI_PRIMARY_API_KEY"
  );
  const openaiKey = firstEnv("OPENAI_API_KEY");
  const explicitCompatKey = firstEnv("AI_COMPAT_API_KEY");
  const huggingFaceKey = firstEnv("HF_TOKEN");
  const explicitCompatBaseUrl = firstEnv("AI_COMPAT_BASE_URL");
  const secondaryKey = firstEnv("AI_SECONDARY_API_KEY") || openaiKey || explicitCompatKey || huggingFaceKey;

  const primaryModel = firstEnv("GEMINI_MODEL", "AI_PRIMARY_MODEL") || "gemini-3.8-flash";

  let compatBaseUrl = explicitCompatBaseUrl;
  let compatKey = "";
  let compatModel = "";

  if (explicitCompatBaseUrl) {
    compatKey = explicitCompatKey || openaiKey || huggingFaceKey || secondaryKey;
    compatModel = firstEnv("AI_COMPAT_MODEL", "OPENAI_MODEL", "AI_SECONDARY_MODEL") || "openai/gpt-oss-120b:fastest";
  } else if (openaiKey) {
    compatBaseUrl = "https://api.openai.com/v1";
    compatKey = openaiKey;
    compatModel = firstEnv("OPENAI_MODEL", "AI_SECONDARY_MODEL", "AI_COMPAT_MODEL") || "gpt-5.6-luna";
  } else if (explicitCompatKey || huggingFaceKey || secondaryKey) {
    compatBaseUrl = "https://router.huggingface.co/v1";
    compatKey = explicitCompatKey || huggingFaceKey || secondaryKey;
    compatModel = firstEnv("AI_COMPAT_MODEL", "AI_SECONDARY_MODEL") || "openai/gpt-oss-120b:fastest";
  }

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
  if (mode === "gemini") return { providers: [primary, local].filter(Boolean), local };
  if (mode === "compat") return { providers: [compatible, primary, local].filter(Boolean), local };
  return { providers: [compatible, primary, local].filter(Boolean), local };
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
    model: "amour-core-v4-fallback",
    fallback: true,
    tried: errors
  };
}
