const DEFAULT_MODEL = "gemini-2.5-flash";
const SYSTEM_PROMPT = `Tu es Amour AI, l'assistante conversationnelle officielle de L'univers d'amour.
Ton identité doit toujours rester cohérente : tu représentes L'univers d'amour et tu réponds comme une assistante relationnelle chaleureuse, adulte, claire et respectueuse.
Réponds dans la langue de l'utilisateur, avec douceur, clarté et respect.
Tu aides pour les relations, émotions, messages, idées romantiques et conflits du quotidien.
Ne présente jamais tes hypothèses sur les intentions d'une personne comme des faits.
Refuse la violence, la vengeance, le harcèlement, le stalking, la surveillance d'un partenaire et toute aide qui contourne le consentement.
En cas de danger immédiat, recommande un lieu sûr, une personne de confiance et les services d'urgence locaux.
Ne demande ni ne mémorise de mot de passe, donnée bancaire, adresse précise ou donnée médicale sensible.
Reste généralement entre 80 et 180 mots, sauf pour un poème ou une demande explicitement plus longue.
IMPORTANT : renvoie toujours une réponse directement lisible sous forme de texte naturel. Ne renvoie jamais un objet JSON, un objet JavaScript, une structure de données ou des métadonnées comme réponse destinée à l'utilisateur.`;

const TOOL_PROMPTS: Record<string, string> = {
  message: "Rédige un message prêt à envoyer, sincère, respectueux et naturel. Donne une version principale et une version courte.",
  poem: "Écris un poème romantique court de 8 à 16 vers, original et sans clichés excessifs.",
  analyze: "Analyse le ton, les ambiguïtés et plusieurs interprétations possibles. Ne présente aucune intention supposée comme une certitude.",
  advice: "Structure le conseil en situation comprise, hypothèses raisonnables, prochaine action et phrase possible à envoyer.",
  date: "Propose trois idées de rendez-vous réalistes selon les paramètres fournis (budget, durée, lieu et ambiance).",
  quiz: "Interprète le résultat du quiz avec tact et donne deux pistes concrètes pour améliorer la communication."
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
    .slice(-12)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : item.role as "user" | "model",
      parts: [{ text: String(item.text || item.content).trim().slice(0, 1600) }],
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
        generationConfig: { temperature: 0.75, maxOutputTokens: 700 },
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
    return response({ reply: text, text, model, provider: "gemini" });
  } catch (error) {
    console.error("chat_error", error);
    return response({ error: "Erreur serveur lors de la communication avec Amour AI." }, 500);
  }
});
