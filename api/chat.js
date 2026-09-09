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

  const body = request.body || {};
  const { messages, message, conversation, mode, tone } = body;
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
    .filter((message) =>
      message &&
      (message.role === "user" || message.role === "model" || message.role === "assistant") &&
      typeof (message.text || message.content) === "string"
    )
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : message.role,
      parts: [{ text: (message.text || message.content).slice(0, 1000) }]
    }));

  if (safeMessages.length === 0) {
    return response.status(400).json({ error: "Aucun message valide." });
  }

  const instruction = mode === "generate"
    ? `Tu es Lumi, une assistante romantique francophone. Génère un message ${tone || "tendre"} sincère, naturel et prêt à envoyer. Réponds uniquement avec le message, sans guillemets ni commentaire.`
    : "Tu es Lumi, une assistante romantique francophone. Réponds avec douceur, empathie et des conseils pratiques. Reste concise (maximum 120 mots). Ne prétends pas remplacer un professionnel et encourage la sécurité et le respect en cas de situation inquiétante.";

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents: safeMessages,
        generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
      })
    }
  );

  if (!geminiResponse.ok) {
    const details = await geminiResponse.text();
    console.error("Gemini API error:", details);
    return response.status(502).json({ error: "L’assistant est temporairement indisponible." });
  }

  const data = await geminiResponse.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return response.status(502).json({ error: "L’assistant n’a pas retourné de réponse." });
  }

  return response.status(200).json({ reply: text.trim(), text: text.trim() });
}
