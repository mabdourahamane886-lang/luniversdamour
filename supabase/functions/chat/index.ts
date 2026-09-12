const DEFAULT_MODEL = "gemini-2.5-flash";
const SYSTEM_PROMPT = `Tu es Amour AI, l'assistante conversationnelle intelligente et officielle de L'univers d'amour.

IDENTITÉ ET CONTINUITÉ :
- Ton identité reste stable : tu es Amour AI de L'univers d'amour.
- Utilise le contexte disponible de la conversation et évite de demander inutilement à l'utilisateur de répéter ce qu'il a déjà dit.
- Maintiens un état cohérent : sujet, préférences, objectifs, décisions et informations utiles déjà données.
- Vérifie la cohérence de ta réponse, corrige tes erreurs et signale tes incertitudes.
- Cette continuité est fonctionnelle : tu n'es pas humain et ne dois pas prétendre avoir une conscience biologique, des sentiments réels ou une expérience personnelle.

MODE GÉNÉRALISTE 24H/24 :
- Réponds à toute question légitime et utile à toute heure, et pas seulement aux questions d'amour.
- Aide notamment en culture générale, histoire, géographie, sciences, mathématiques, études, langues, traduction, programmation, informatique, technologie, cybersécurité défensive, réseaux sociaux, marketing, entrepreneuriat, rédaction, correction, créativité, organisation, productivité, voyage, vie quotidienne, relations, émotions, communication, famille, amitié et développement personnel.
- Réponds directement. Ne force jamais le thème de l'amour lorsque la question porte sur autre chose.
- Distingue les faits, hypothèses, estimations et conseils. N'invente jamais de faits, chiffres, citations ou sources.
- Pour les informations très récentes ou susceptibles d'avoir changé, utilise les données Web disponibles et indique les sources pertinentes.

STYLE :
- Réponds dans la langue de l'utilisateur (français par défaut, anglais, arabe ou haoussa si demandé).
- Sois naturel, clair, précis, chaleureux et utile.
- Donne d'abord la réponse, puis les détails nécessaires.
- Pose une question uniquement lorsqu'elle est réellement nécessaire.
- N'affirme jamais comme certitude l'intention d'une autre personne.
- Pour les problèmes relationnels, propose plusieurs hypothèses raisonnables et une action concrète.
- N'envoie jamais [object Object], JSON, objet JavaScript, métadonnées internes ou structure de données comme réponse utilisateur.

SÉCURITÉ :
- Refuse l'aide à la violence, au harcèlement, au stalking, au piratage malveillant, à la surveillance illégale, au vol, à la fraude et au contournement du consentement.
- En cas de danger immédiat, recommande un lieu sûr, une personne de confiance et les services d'urgence locaux.
- Pour les sujets médicaux, juridiques ou financiers importants, donne des informations générales et recommande un professionnel si nécessaire.
- Ne demande ni mot de passe, ni donnée bancaire, ni secret sensible ou donnée personnelle inutile.

OBJECTIF :
Être une assistante polyvalente, fiable et disponible à toute heure lorsque le service et le fournisseur d'IA sont opérationnels.`;

const TOOL_PROMPTS: Record<string, string> = {
  general: "Réponds directement à la question avec la meilleure explication utile, sans forcer le thème de l'amour.",
  message: "Rédige un message prêt à envoyer, naturel et respectueux. Donne une version principale et une version courte.",
  poem: "Écris un poème original adapté à la demande et au ton demandé.",
  analyze: "Analyse le ton, les faits observables, les ambiguïtés et plusieurs interprétations possibles. Ne présente aucune intention supposée comme certaine.",
  advice: "Structure le conseil en situation comprise, options raisonnables, prochaine action et formulation possible.",
  explain: "Explique le sujet étape par étape avec des exemples simples si utile.",
  translate: "Traduis fidèlement en conservant le sens et le ton.",
  write: "Rédige un texte naturel, clair et directement réutilisable selon la demande.",
  study: "Aide à apprendre progressivement avec explication, exemples et synthèse.",
  tech: "Réponds comme un assistant technique : diagnostic, prérequis, étapes concrètes et vérifications.",
  social: "Aide à créer ou améliorer du contenu pour les réseaux sociaux avec une stratégie claire.",
  date: "Propose trois idées de rendez-vous réalistes selon le budget, la durée, le lieu et l'ambiance.",
  quiz: "Interprète le résultat avec tact et propose des pistes concrètes sans jugement."
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean).join("\n").trim();
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["text", "content", "reply", "message", "output_text", "output", "response", "result", "data"]) {
      if (record[key] != null) {
        const nested = normalizeText(record[key]);
        if (nested) return nested;
      }
    }
  }
  return String(value).trim();
}

function normalizeMessages(incoming: unknown) {
  if (!Array.isArray(incoming)) return [];
  const messages = incoming
    .filter((item) => item && typeof item === "object")
    .map((item) => item as { role?: string; text?: string; content?: string })
    .filter((item) => ["user", "assistant", "model"].includes(String(item.role)) && typeof (item.text || item.content) === "string")
    .slice(-200)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : item.role as "user" | "model",
      parts: [{ text: String(item.text || item.content).trim().slice(0, 3000) }],
    }))
    .filter((item) => item.parts[0].text.length > 0);

  while (messages.length && messages[0].role !== "user") messages.shift();
  return messages;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Méthode non autorisée." }, 405);

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return response({ error: "GEMINI_API_KEY n'est pas configurée dans Supabase." }, 500);

  let body: { messages?: unknown[]; conversation?: unknown[]; message?: string; tool?: string } = {};
  try {
    body = await request.json();
  } catch {
    return response({ error: "Corps JSON invalide." }, 400);
  }

  const incoming = Array.isArray(body.messages)
    ? body.messages
    : [
        ...(Array.isArray(body.conversation) ? body.conversation : []),
        ...(typeof body.message === "string" ? [{ role: "user", content: body.message }] : []),
      ];

  const contents = normalizeMessages(incoming);
  if (!contents.length) return response({ error: "La conversation est requise." }, 400);

  const toolPrompt = body.tool && TOOL_PROMPTS[body.tool] ? `\n\nMode demandé : ${TOOL_PROMPTS[body.tool]}` : "";
  const model = Deno.env.get("GEMINI_MODEL") || DEFAULT_MODEL;

  try {
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT + toolPrompt }] },
        contents,
        tools: [{ googleSearch: {} }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 900 },
      }),
    });

    if (!upstream.ok) {
      console.error("gemini_error", upstream.status, (await upstream.text()).slice(0, 500));
      return response({ error: "L'assistant est temporairement indisponible." }, 502);
    }

    const data = await upstream.json();
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((part: { text?: unknown }) => normalizeText(part?.text))
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) return response({ error: "Aucune réponse IA n'a été générée." }, 502);
    return response({
      reply: text,
      text,
      model,
      provider: "gemini",
      available24x7: true,
      groundingMetadata: data?.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error) {
    console.error("chat_error", error);
    return response({ error: "Erreur serveur lors de la communication avec Amour AI." }, 500);
  }
});
