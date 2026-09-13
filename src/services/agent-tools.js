import { searchKnowledge } from "./knowledge-service.js";
import { extractExplicitMemories, saveMemories } from "./ai-memory-service.js";

function cleanQuery(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 800);
}

function inferIntent(text, requestedTool = "") {
  const forced = String(requestedTool || "").trim().toLowerCase();
  if (forced) return forced;
  const q = String(text || "").toLowerCase();
  if (/(tradui|traduire|translation|translate)/i.test(q)) return "translate";
  if (/(écris|ecris|message|sms|whatsapp)/i.test(q)) return "message";
  if (/(analyse|analyser|que pense|interprète|interprete)/i.test(q)) return "analyze";
  if (/(conseil|que faire|devrais-je|devrais je)/i.test(q)) return "advice";
  if (/(explique|expliquer|comment fonctionne|définition|definition)/i.test(q)) return "explain";
  if (/(apprendre|cours|exercice|réviser|reviser|étudier|etudier)/i.test(q)) return "study";
  if (/(code|programm|javascript|python|github|vercel|supabase|api)/i.test(q)) return "tech";
  if (/(instagram|facebook|tiktok|publication|post|hashtag|viral)/i.test(q)) return "social";
  return "general";
}

export function planAgent({ userText, requestedTool }) {
  const intent = inferIntent(userText, requestedTool);
  const tools = ["knowledge_search"];
  if (/(souviens|rappelle|garde en mémoire|n'oublie pas)/i.test(String(userText || ""))) {
    tools.push("memory_write");
  }
  return { intent, tools: [...new Set(tools)] };
}

export async function executeAgentTools({ tools, query, sessionId, memoryEnabled }) {
  const result = { knowledge: [], memorySaved: false, toolRuns: [] };
  const requested = new Set(Array.isArray(tools) ? tools : []);

  if (requested.has("knowledge_search")) {
    result.knowledge = await searchKnowledge(cleanQuery(query), 6);
    result.toolRuns.push({ name: "knowledge_search", ok: true, count: result.knowledge.length });
  }

  if (requested.has("memory_write") && memoryEnabled) {
    const memories = extractExplicitMemories(query, true);
    if (memories.length) {
      result.memorySaved = await saveMemories(sessionId, memories);
      result.toolRuns.push({ name: "memory_write", ok: result.memorySaved, count: memories.length });
    } else {
      result.toolRuns.push({ name: "memory_write", ok: true, count: 0 });
    }
  }

  return result;
}
