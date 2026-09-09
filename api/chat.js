const MODEL = "gemini-flash-latest";

export default async function handler(request, response) {
  // Logging basique
  console.log(`[${new Date().toISOString()}] ${request.method} /api/chat`);

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Méthode non autorisée." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in environment");
    return response.status(500).json({
      error: "La clé GEMINI_API_KEY n'est pas configurée. Allez dans Vercel Settings → Environment Variables et ajoutez-la."
    });
  }

  console.log("API Key found, processing request...");

  let body = {};
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {};
  } catch (e) {
    console.error("Parse error:", e.message);
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
    console.error("No valid messages found");
    return response.status(400).json({ error: "La conversation est requise." });
  }

  const safeMessages = incomingMessages
    .filter((msg) =>
      msg &&
      (msg.role === "user" || msg.role === "model" || msg.role === "assistant") &&
      typeof (msg.text || msg.content) === "string"
    )
    .slice(-12)
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: String(msg.text || msg.content).slice(0, 1000) }]
    }));

  if (safeMessages.length === 0) {
    console.error("No safe messages after filtering");
    return response.status(400).json({ error: "Aucun message valide." });
  }

  const systemPrompt = "Tu es Amour AI, une assistante romantique francophone. Réponds avec douceur, empathie et des conseils pratiques. Reste concise (maximum 150 mots). Ne prétends pas remplacer un professionnel et encourage la sécurité et le respect en cas de situation inquiétante.";

  try {
    console.log(`Calling Gemini ${MODEL} with ${safeMessages.length} messages...`);
    
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
          contents: safeMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API ${geminiResponse.status}:`, errorText.slice(0, 200));
      return response.status(502).json({
        error: "L'assistant est temporairement indisponible. Veuillez réessayer."
      });
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Empty response from Gemini:", JSON.stringify(data).slice(0, 200));
      return response.status(502).json({
        error: "L'assistant n'a pas pu générer une réponse."
      });
    }

    console.log("Success: Generated response");
    return response.status(200).json({ reply: text.trim(), text: text.trim() });
  } catch (error) {
    console.error("API Error:", error.message);
    return response.status(500).json({
      error: "Erreur serveur lors de la communication avec l'assistant."
    });
  }
}
