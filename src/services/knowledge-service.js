const SUPABASE_URL = () => String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const DEFAULT_LIMIT = 5;

function headers() {
  const key = SUPABASE_KEY();
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`
  };
}

function normalizeQuery(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 800);
}

export async function searchKnowledge(query, maxResults = DEFAULT_LIMIT) {
  const searchText = normalizeQuery(query);
  if (!searchText || !SUPABASE_URL() || !SUPABASE_KEY()) return [];

  try {
    const response = await fetch(`${SUPABASE_URL()}/rest/v1/rpc/search_amour_ai_knowledge`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        search_text: searchText,
        max_results: Math.max(1, Math.min(Number(maxResults) || DEFAULT_LIMIT, 8))
      })
    });

    if (!response.ok) return [];
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  } catch (_) {
    return [];
  }
}

export function buildKnowledgeContext(items) {
  if (!Array.isArray(items) || !items.length) return "";

  const sections = items
    .filter((item) => item?.title && item?.content)
    .slice(0, 8)
    .map((item) => `### ${item.title}\n${String(item.content).trim()}`);

  if (!sections.length) return "";

  return `\n\nBASE DE CONNAISSANCES OFFICIELLE DE L'UNIVERS D'AMOUR :\n${sections.join("\n\n")}\n\nUtilise cette base comme source prioritaire lorsqu'elle est pertinente. Ne prétends pas qu'un élément est vrai uniquement parce qu'il est présent : reste cohérent, nuance les conseils et signale les limites de l'information.`;
}
