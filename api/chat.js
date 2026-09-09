const MODEL = "gemini-2.5-flash";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Méthode non autorisée." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: "La clé GEMINI_API_KEY n’est pas configurée sur le serveur."
    });
  }

  let body = {};
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {};
  } catch (e) {
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
    return response.status(400).json({ error: "Aucun message valide." });
  }

  const systemPrompt = "Tu es Amour AI, une assistante romantique francophone. Réponds avec douceur, empathie et des conseils pratiques. Reste concise (maximum 150 mots). Ne prétends pas remplacer un professionnel et encourage la sécurité et le respect en cas de situation inquiétante.";

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: safeMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
            topP: 0.95,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API ${geminiResponse.status}:`, errorText);
      return response.status(502).json({
        error: "L'assistant est temporairement indisponible. Veuillez réessayer."
      });
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Empty response from Gemini:", data);
      return response.status(502).json({
        error: "L'assistant n'a pas pu générer une réponse."
      });
    }

    return response.status(200).json({ reply: text.trim(), text: text.trim() });
  } catch (error) {
    console.error("API Error:", error);
    return response.status(500).json({
      error: "Erreur serveur lors de la communication avec l'assistant."
    });
  }
}
