import { generateWithFallback } from "../ai/provider-factory.js";
import { SYSTEM_PROMPT, TOOL_PROMPTS, PROMPT_VERSION } from "../ai/prompts.js";
import { moderateContent } from "../ai/moderation.js";
import { normalizeMessages } from "../shared/validation.js";
import { redactForLogs } from "../ai/memory.js";
import { buildMemoryContext, extractExplicitMemories, loadMemories, saveMemories } from "./ai-memory-service.js";
import { buildKnowledgeContext } from "./knowledge-service.js";
import { executeAgentTools, planAgent } from "./agent-tools.js";
import { repairResponse } from "../ai/response-verifier.js";

const SUPABASE_URL = () => String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

async function writeRunTrace({ sessionId, plan, result, toolResult, memoryUsed, verified, issues, latencyMs }) {
  if (!SUPABASE_URL() || !SUPABASE_KEY()) return;
  const row = {
    session_id: String(sessionId || "").slice(0, 160) || null,
    intent: plan.intent,
    tool_names: toolResult.toolRuns.map((item) => item.name),
    provider: result?.provider || null,
    model: result?.model || null,
    knowledge_count: toolResult.knowledge.length,
    memory_used: Boolean(memoryUsed),
    verified: Boolean(verified),
    verification_issues: Array.isArray(issues) ? issues.slice(0, 8) : [],
    latency_ms: Math.max(0, Math.min(Number(latencyMs) || 0, 120000))
  };
  try {
    await fetch(`${SUPABASE_URL()}/rest/v1/ai_agent_runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY(),
        Authorization: `Bearer ${SUPABASE_KEY()}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify(row)
    });
  } catch (_) {
    // Observability must never break the user's conversation.
  }
}

export async function runAgent({ payload, tool }) {
  const startedAt = Date.now();
  const messages = normalizeMessages(payload);
  const lastUser = [...messages].reverse().find((item) => item.role === "user");
  const userText = String(lastUser?.content || "").trim();
  const sessionId = String(payload.sessionId || "").trim();
  const memoryEnabled = payload.memoryEnabled !== false;

  const moderation = moderateContent(userText);
  if (!moderation.allowed) {
    return {
      blocked: true,
      text: moderation.message,
      provider: "moderation",
      model: "policy",
      promptVersion: PROMPT_VERSION,
      intent: "moderation",
      tools: [],
      knowledgeUsed: 0,
      verified: true,
      verificationIssues: []
    };
  }

  const plan = planAgent({ userText, requestedTool: tool });
  const memories = memoryEnabled ? await loadMemories(sessionId) : [];
  const memoryContext = buildMemoryContext(memories);
  const toolResult = await executeAgentTools({
    tools: plan.tools,
    query: userText,
    sessionId,
    memoryEnabled
  });
  const knowledgeContext = buildKnowledgeContext(toolResult.knowledge);
  const extra = TOOL_PROMPTS[plan.intent] ? `\n\nMode outil : ${TOOL_PROMPTS[plan.intent]}` : "";

  console.info("amour_agent", {
    intent: plan.intent,
    tools: plan.tools,
    knowledge: toolResult.knowledge.length,
    memory: Boolean(memoryContext),
    preview: redactForLogs(userText)
  });

  const result = await generateWithFallback({
    systemPrompt: `${SYSTEM_PROMPT}\n\nAGENT AMOUR AI :\n- Intention détectée : ${plan.intent}.\n- Outils exécutés : ${plan.tools.join(", ") || "aucun"}.\n- Si une connaissance récupérée est pertinente, utilise-la comme contexte et ne prétends pas avoir consulté une source externe.\n- Vérifie la cohérence avec la mémoire avant de répondre.\n- Tu n'exécutes aucune action externe non explicitement fournie par un outil.\n${memoryContext}${knowledgeContext}${extra}`,
    messages,
    knowledge: toolResult.knowledge
  });

  const verified = repairResponse(result?.text, "Je n'ai pas pu produire une réponse fiable pour le moment.");
  const explicitMemories = memoryEnabled ? extractExplicitMemories(userText, true) : [];
  let memorySaved = Boolean(toolResult.memorySaved);
  if (explicitMemories.length && !memorySaved) {
    memorySaved = await saveMemories(sessionId, explicitMemories);
  }

  await writeRunTrace({
    sessionId,
    plan,
    result,
    toolResult,
    memoryUsed: memories.length > 0,
    verified: verified.ok,
    issues: verified.issues,
    latencyMs: Date.now() - startedAt
  });

  return {
    blocked: false,
    text: verified.text,
    provider: result?.provider || "unknown",
    model: result?.model || "unknown",
    knowledgeUsed: toolResult.knowledge.length,
    memoryUsed: memories.length > 0,
    memorySaved,
    intent: plan.intent,
    tools: toolResult.toolRuns.map((item) => item.name),
    verified: verified.ok,
    verificationIssues: verified.issues,
    promptVersion: PROMPT_VERSION
  };
}
