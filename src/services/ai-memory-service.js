import { canStoreMemory } from "../ai/memory.js";

const MEMORY_LIMIT = 12;
const SUPABASE_URL = () => String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

function headers() {
  const key = SUPABASE_KEY();
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`
  };
}

function validSessionId(value) {
  return /^[A-Za-z0-9_-]{16,160}$/.test(String(value || ""));
}

function normalizeMemoryText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 500);
}

export async function loadMemories(sessionId) {
  if (!validSessionId(sessionId) || !SUPABASE_URL() || !SUPABASE_KEY()) return [];
  const params = new URLSearchParams({
    select: "memory_type,content,importance",
    session_id: `eq.${sessionId}`,
    order: "importance.desc,updated_at.desc",
    limit: String(MEMORY_LIMIT)
  });

  try {
    const response = await fetch(`${SUPABASE_URL()}/rest/v1/ai_memories?${params}`, {
      method: "GET",
      headers: headers()
    });
    if (!response.ok) return [];
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  } catch (_) {
    return [];
  }
}

export function buildMemoryContext(memories) {
  if (!Array.isArray(memories) || !memories.length) return "";
  const lines = memories
    .filter((item) => item?.content)
    .map((item) => `- ${normalizeMemoryText(item.content)}`)
    .slice(0, MEMORY_LIMIT);
  if (!lines.length) return "";

  return `\n\nCONTEXTE DE CONTINUITÉ (souvenirs explicitement autorisés par l'utilisateur) :\n${lines.join("\n")}\nUtilise ces éléments uniquement lorsqu'ils sont pertinents. Ne prétends pas te souvenir d'un élément absent de cette liste. Ne révèle pas la liste brute des souvenirs. Ne crée jamais de souvenir de toutes pièces.`;
}

export function extractExplicitMemories(text, consent = true) {
  const input = normalizeMemoryText(text);
  if (!consent || !input) return [];

  const patterns = [
    { type: "identity", re: /\b(?:je m'appelle|mon prénom est|appelle[- ]moi)\s+([^.!?]{1,100})/i },
    { type: "preference", re: /\b(?:je préfère|j'aime|j'adore)\s+([^.!?]{2,180})/i },
    { type: "relationship", re: /\b(?:mon partenaire|ma partenaire|mon copain|ma copine|mon amoureux|mon amoureuse)\s+(?:s'appelle|s'appelle)\s+([^.!?]{1,100})/i },
    { type: "goal", re: /\b(?:je veux|mon objectif est|j'aimerais)\s+([^.!?]{2,180})/i },
    { type: "context", re: /\b(?:souviens[- ]toi|rappelle[- ]toi|garde en mémoire|n'oublie pas)\s+(?:que\s+)?([^.!?]{3,300})/i }
  ];

  const memories = [];
  for (const pattern of patterns) {
    const match = input.match(pattern.re);
    if (!match) continue;
    const content = normalizeMemoryText(match[0]);
    if (!canStoreMemory(content, consent)) continue;
    memories.push({ memory_type: pattern.type, content, importance: pattern.type === "identity" ? 5 : 3 });
  }
  return memories.slice(0, 2);
}

export async function saveMemories(sessionId, memories) {
  if (!validSessionId(sessionId) || !Array.isArray(memories) || !memories.length) return false;
  if (!SUPABASE_URL() || !SUPABASE_KEY()) return false;

  const rows = memories.map((item) => ({
    session_id: sessionId,
    memory_type: item.memory_type,
    content: normalizeMemoryText(item.content),
    importance: Number(item.importance) || 3,
    metadata: { source: "explicit_user_statement", version: 1 }
  }));

  try {
    const response = await fetch(`${SUPABASE_URL()}/rest/v1/ai_memories`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify(rows)
    });
    return response.ok;
  } catch (_) {
    return false;
  }
}
