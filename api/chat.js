const MODEL = "gemini-2.5-flash";

export default async function handler(request, response) {
  console.log(`[${new Date().toISOString()}] ${request.method} /api/chat`);

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Méthode non autorisée." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in environment");
    return response.status(500).json({
      error: "La clé GEMINI_API_KEY n'est pas configurée. Ajoutez-la dans les variables d'environnement Vercel."
    });
  }

  let body = {};
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {};
  } catch (error) {
    console.error("Parse error:", error.message);
    return response.status(400).json({ error: "Corps de la requête invalide." });
  }

  const { messages, message, conversation } = body;
  const incomingMessages = Array.isArray(messages)
    ? messages
    : [
        ...(Array.isArray(conversation) ? conversation : []),
        ...(typeof message === "string" ? [{ role: "user", content: message }] : [])
      ];

  if (incomingMessages.length === 0) {
    return response.status(400).json({ error: "La conversation est requise." });
  }

  const safeMessages = incomingMessages
    .filter((item) =>
      item &&
      (item.role === "user" || item.role === "assistant" || item.role === "model") &&
      typeof (item.text || item.content) === "string"
    )
    .slice(-12)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : item.role,
      parts: [{ text: String(item.text || item.content).slice(0, 1000) }]
    }));

  if (safeMessages.length === 0) {
    return response.status(400).json({ error: "Aucun message valide." });
  }

  const contents = [];
  for (const item of safeMessages) {
    const last = contents[contents.length - 1];
    if (last && last.role === item.role) {
      last.parts[0].text += `\n${item.parts[0].text}`;
    } else {
      contents.push({
        role: item.role,
        parts: [{ text: item.parts[0].text }]
      });
    }
  }

  while (contents.length && contents[0].role !== "user") {
    contents.shift();
  }

  if (contents.length === 0) {
    return response.status(400).json({ error: "Aucun message utilisateur valide." });
  }

  const systemPrompt =
    "Tu es Amour AI, une assistante romantique francophone. Réponds avec douceur, empathie et des conseils pratiques. Reste concise (maximum 150 mots). Ne prétends pas remplacer un professionnel et encourage la sécurité et le respect en cas de situation inquiétante.";

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API ${geminiResponse.status}:`, errorText.slice(0, 300));
      return response.status(502).json({
        error: "L'assistant est temporairement indisponible. Veuillez réessayer."
      });
    }

    const data = await geminiResponse.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts
      .map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      console.error("Empty response from Gemini:", JSON.stringify(data).slice(0, 300));
      return response.status(502).json({
        error: "L'assistant n'a pas pu générer une réponse."
      });
    }

    return response.status(200).json({ reply: text, text });
  } catch (error) {
    console.error("API Error:", error.message);
    return response.status(500).json({
      error: "Erreur serveur lors de la communication avec l'assistant."
    });
  }
}
