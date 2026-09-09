import { generateWithFallback } from "../ai/provider-factory.js";
import { SYSTEM_PROMPT, TOOL_PROMPTS, PROMPT_VERSION } from "../ai/prompts.js";
import { moderateContent } from "../ai/moderation.js";
import { normalizeMessages, sanitizeText } from "../shared/validation.js";
import { AppError } from "../shared/errors.js";
import { redactForLogs } from "../ai/memory.js";

export async function runGeneration({ payload, tool }) {
  const messages = normalizeMessages(payload);
  const lastUser = [...messages].reverse().find((item) => item.role === "user");
  if (!lastUser) {
    throw new AppError("VALIDATION_ERROR", "Aucun message utilisateur valide.", 400);
  }

  const moderation = moderateContent(lastUser.content);
  if (!moderation.allowed) {
    return {
      blocked: true,
      text: moderation.message,
      provider: "moderation",
      model: "policy",
      promptVersion: PROMPT_VERSION
    };
  }

  const extra = tool && TOOL_PROMPTS[tool] ? `\n\nMode outil : ${TOOL_PROMPTS[tool]}` : "";
  console.info("ai_request", { tool: tool || "chat", preview: redactForLogs(lastUser.content) });

  const result = await generateWithFallback({
    systemPrompt: SYSTEM_PROMPT + extra,
    messages
  });

  return {
    blocked: false,
    text: result.text,
    provider: result.provider,
    model: result.model,
    promptVersion: PROMPT_VERSION
  };
}

export function optionalSanitize(text) {
  return sanitizeText(text);
}
