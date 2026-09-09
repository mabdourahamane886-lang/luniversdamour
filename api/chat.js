const MODEL = "gpt-3.5-turbo";

export default async function handler(request, response) {
  console.log(`[${new Date().toISOString()}] ${request.method} /api/chat`);

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Méthode non autorisée." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY not found in environment");
    return response.status(500).json({
      error: "La clé OPENAI_API_KEY n'est pas configurée. Allez dans Vercel Settings → Environment Variables et ajoutez-la."
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
      (msg.role === "user" || msg.role === "assistant" || msg.role === "model") &&
      typeof (msg.text || msg.content) === "string"
    )
    .slice(-12)
    .map((msg) => ({
      role: msg.role === "model" ? "assistant" : msg.role,
      content: String(msg.text || msg.content).slice(0, 1000)
    }));

  if (safeMessages.length === 0) {
    console.error("No safe messages after filtering");
    return response.status(400).json({ error: "Aucun message valide." });
  }

  const systemPrompt = "Tu es Amour AI, une assistante romantique francophone. Réponds avec douceur, empathie et des conseils pratiques. Reste concise (maximum 150 mots). Ne prétends pas remplacer un professionnel et encourage la sécurité et le respect en cas de situation inquiétante.";

  try {
    console.log(`Calling OpenAI ${MODEL} with ${safeMessages.length} messages...`);
    
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...safeMessages
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error(`OpenAI API ${openaiResponse.status}:`, errorText.slice(0, 200));
      return response.status(502).json({
        error: "L'assistant est temporairement indisponible. Veuillez réessayer."
      });
    }

    const data = await openaiResponse.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Empty response from OpenAI:", JSON.stringify(data).slice(0, 200));
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
