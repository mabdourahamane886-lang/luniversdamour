import { AI_TIMEOUT_DEFAULT, MAX_OUTPUT_TOKENS_DEFAULT } from "../shared/constants.js";
import { GeminiProvider } from "./providers/gemini.js";
import { OpenAICompatibleProvider } from "./providers/openai.js";

function envInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createProviders() {
  const timeoutMs = envInt("AI_TIMEOUT_MS", AI_TIMEOUT_DEFAULT);
  const maxOutputTokens = envInt("AI_MAX_OUTPUT_TOKENS", MAX_OUTPUT_TOKENS_DEFAULT);
  const primaryKey = process.env.AI_PRIMARY_API_KEY || process.env.GEMINI_API_KEY;
  const secondaryKey = process.env.AI_SECONDARY_API_KEY || process.env.OPENAI_API_KEY;
  const primaryModel =
    process.env.AI_PRIMARY_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const secondaryModel = process.env.AI_SECONDARY_MODEL || "gpt-4o-mini";

  const primary = primaryKey
    ? new GeminiProvider({
        apiKey: primaryKey,
        model: primaryModel,
        timeoutMs,
        maxOutputTokens
      })
    : null;

  const secondary = secondaryKey
    ? new OpenAICompatibleProvider({
        apiKey: secondaryKey,
        model: secondaryModel,
        timeoutMs,
        maxOutputTokens
      })
    : null;

  return { primary, secondary };
}

export async function generateWithFallback({ systemPrompt, messages }) {
  const { primary, secondary } = createProviders();
  if (!primary && !secondary) {
    const error = new Error("NO_PROVIDER");
    error.status = 503;
    throw error;
  }

  const errors = [];
  for (const provider of [primary, secondary].filter(Boolean)) {
    try {
      return await provider.generateText({ systemPrompt, messages });
    } catch (error) {
      errors.push(provider.name);
      console.error("provider_fallback", provider.name, error.message);
    }
  }

  const error = new Error("ALL_PROVIDERS_FAILED");
  error.status = 502;
  error.tried = errors;
  throw error;
}
