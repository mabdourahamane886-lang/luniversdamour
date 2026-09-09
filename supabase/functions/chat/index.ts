const MODEL = "gemini-2.5-flash";
const SYSTEM_PROMPT =
  "Tu es Amour AI, une assistante romantique francophone. Réponds avec douceur, empathie et des conseils pratiques. Reste concise (maximum 150 mots). Ne prétends pas remplacer un professionnel et encourage la sécurité et le respect en cas de situation inquiétante.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function buildContents(incoming: unknown[]) {
  const safeMessages = incoming
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const message = item as { role?: string; text?: string; content?: string };
      return (
        (message.role === "user" ||
          message.role === "assistant" ||
          message.role === "model") &&
        typeof (message.text || message.content) === "string"
      );
    })
    .slice(-12)
    .map((item) => {
      const message = item as { role: string; text?: string; content?: string };
      return {
        role: message.role === "assistant" ? "model" : message.role,
        parts: [{ text: String(message.text || message.content).slice(0, 1000) }],
      };
    });

  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const item of safeMessages) {
    const last = contents[contents.length - 1];
    if (last && last.role === item.role) {
      last.parts[0].text += `\n${item.parts[0].text}`;
    } else {
      contents.push({
        role: item.role,
        parts: [{ text: item.parts[0].text }],
      });
    }
  }

  while (contents.length && contents[0].role !== "user") {
    contents.shift();
  }

  return contents;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Méthode non autorisée." }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonResponse({
      error: "La clé GEMINI_API_KEY n'est pas configurée dans Supabase.",
    }, 500);
  }

  let body: {
    messages?: unknown[];
    conversation?: unknown[];
    message?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Corps de la requête invalide." }, 400);
  }

  const incomingMessages = Array.isArray(body.messages)
    ? body.messages
    : [
        ...(Array.isArray(body.conversation) ? body.conversation : []),
        ...(typeof body.message === "string"
          ? [{ role: "user", content: body.message }]
          : []),
      ];

  if (incomingMessages.length === 0) {
    return jsonResponse({ error: "La conversation est requise." }, 400);
  }

  const contents = buildContents(incomingMessages);
  if (contents.length === 0) {
    return jsonResponse({ error: "Aucun message utilisateur valide." }, 400);
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API ${geminiResponse.status}:`, errorText.slice(0, 300));
      return jsonResponse({
        error: "L'assistant est temporairement indisponible. Veuillez réessayer.",
      }, 502);
    }

    const data = await geminiResponse.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      return jsonResponse({
        error: "L'assistant n'a pas pu générer une réponse.",
      }, 502);
    }

    return jsonResponse({ reply: text, text });
  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse({
      error: "Erreur serveur lors de la communication avec l'assistant.",
    }, 500);
  }
});
