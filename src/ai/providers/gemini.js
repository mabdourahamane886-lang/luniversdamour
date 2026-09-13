import { AIProvider, withTimeout } from "../AIProvider.js";

export class GeminiProvider extends AIProvider {
  constructor({ apiKey, model, fallbackModel, timeoutMs, maxOutputTokens }) {
    super();
    this.apiKey = apiKey;
    this.model = model || "gemini-2.5-flash";
    this.fallbackModel = fallbackModel || "gemini-2.5-flash-lite";
    this.timeoutMs = timeoutMs;
    this.maxOutputTokens = maxOutputTokens;
  }

  get name() {
    return "gemini";
  }

  buildContents(messages) {
    const contents = [];
    for (const item of messages) {
      const role = item.role === "assistant" ? "model" : item.role;
      if (role !== "user" && role !== "model") continue;
      const text = String(item.content || item.text || "").trim();
      if (!text) continue;
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
    return contents;
  }

  async requestModel(model, systemPrompt, contents) {
    const request = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
      console.error("gemini_provider_error", response.status, errorText.slice(0, 300));
      throw new Error(`GEMINI_${response.status}`);
    }

    const data = await response.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!text) throw new Error("EMPTY_MODEL_RESPONSE");

    return {
      text,
      provider: this.name,
      model,
      groundingMetadata: data.candidates?.[0]?.groundingMetadata || null
    };
  }

  async generateText({ systemPrompt, messages }) {
    const contents = this.buildContents(messages);
    if (!contents.length) throw new Error("EMPTY_CONTENTS");

    try {
      return await this.requestModel(this.model, systemPrompt, contents);
    } catch (primaryError) {
      if (!this.fallbackModel || this.fallbackModel === this.model) throw primaryError;
      try {
        console.warn("gemini_model_fallback", this.model, this.fallbackModel);
        return await this.requestModel(this.fallbackModel, systemPrompt, contents);
      } catch (fallbackError) {
        console.error("gemini_fallback_failed", fallbackError.message);
        throw primaryError;
      }
    }
  }
}
