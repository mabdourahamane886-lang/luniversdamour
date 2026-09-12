import { AIProvider, withTimeout } from "../AIProvider.js";

export class GeminiProvider extends AIProvider {
  constructor({ apiKey, model, timeoutMs, maxOutputTokens }) {
    super();
    this.apiKey = apiKey;
    this.model = model || "gemini-3.8-flash";
    this.timeoutMs = timeoutMs;
    this.maxOutputTokens = maxOutputTokens;
  }

  get name() {
    return "gemini";
  }

  async generateText({ systemPrompt, messages }) {
    const contents = [];
    for (const item of messages) {
      const role = item.role === "assistant" ? "model" : item.role;
      const text = item.content || item.text;
      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n${text}`;
      } else {
        contents.push({ role, parts: [{ text }] });
      }
    }
    while (contents.length && contents[0].role !== "user") {
      contents.shift();
    }
    if (!contents.length) {
      throw new Error("EMPTY_CONTENTS");
    }

    const request = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": this.apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: this.maxOutputTokens
          }
        })
      }
    );

    const response = await withTimeout(request, this.timeoutMs);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("primary_provider_error", response.status, errorText.slice(0, 120));
      throw new Error("PRIMARY_UNAVAILABLE");
    }
    const data = await response.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!text) {
      throw new Error("EMPTY_MODEL_RESPONSE");
    }
    return { text, provider: this.name, model: this.model };
  }
}
