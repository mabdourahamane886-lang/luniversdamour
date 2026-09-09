import { AIProvider, withTimeout } from "../AIProvider.js";

export class OpenAICompatibleProvider extends AIProvider {
  constructor({ apiKey, model, timeoutMs, maxOutputTokens, baseUrl }) {
    super();
    this.apiKey = apiKey;
    this.model = model || "gpt-4o-mini";
    this.timeoutMs = timeoutMs;
    this.maxOutputTokens = maxOutputTokens;
    this.baseUrl = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  }

  get name() {
    return "openai";
  }

  async generateText({ systemPrompt, messages }) {
    const payload = [
      { role: "system", content: systemPrompt },
      ...messages.map((item) => ({
        role: item.role === "model" ? "assistant" : item.role,
        content: item.content || item.text
      }))
    ];

    const request = fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.apiKey
      },
      body: JSON.stringify({
        model: this.model,
        messages: payload,
        temperature: 0.7,
        max_tokens: this.maxOutputTokens
      })
    });

    const response = await withTimeout(request, this.timeoutMs);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("secondary_provider_error", response.status, errorText.slice(0, 120));
      throw new Error("SECONDARY_UNAVAILABLE");
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("EMPTY_MODEL_RESPONSE");
    }
    return { text, provider: this.name, model: this.model };
  }
}
