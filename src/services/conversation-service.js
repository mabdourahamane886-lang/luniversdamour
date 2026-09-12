import { generateWithFallback } from "../ai/provider-factory.js";
import { SYSTEM_PROMPT, TOOL_PROMPTS, PROMPT_VERSION } from "../ai/prompts.js";
import { moderateContent } from "../ai/moderation.js";
import { normalizeMessages, sanitizeText } from "../shared/validation.js";
import { AppError } from "../shared/errors.js";
import { redactForLogs } from "../ai/memory.js";
import { buildMemoryContext, extractExplicitMemories, loadMemories, saveMemories } from "./ai-memory-service.js";

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
  const sessionId = String(payload.sessionId || "").trim();
  const memoryEnabled = payload.memoryEnabled !== false;
  const memories = memoryEnabled ? await loadMemories(sessionId) : [];
  const memoryContext = buildMemoryContext(memories);

  console.info("ai_request", {
    tool: tool || "chat",
    preview: redactForLogs(lastUser.content),
    memory: Boolean(memoryContext)
  });

  const result = await generateWithFallback({
    systemPrompt: SYSTEM_PROMPT + memoryContext + extra,
    messages
  });

  if (memoryEnabled) {
    const explicitMemories = extractExplicitMemories(lastUser.content, true);
    if (explicitMemories.length) {
      await saveMemories(sessionId, explicitMemories);
    }
  }

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
