export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "GET only" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const keyStatus = apiKey ? "✅ Configurée" : "❌ Manquante";

  return response.status(200).json({
    status: "API diagnostics",
    gemini_api_key: keyStatus,
    node_version: process.version,
    timestamp: new Date().toISOString(),
    message: "L'API est accessible. Si GEMINI_API_KEY est configurée, utilisez POST /api/chat"
  });
}
