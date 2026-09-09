import { MAX_MESSAGE_LENGTH, MAX_HISTORY_MESSAGES } from "./constants.js";
import { AppError } from "./errors.js";

const ALLOWED_ROLES = new Set(["user", "assistant", "model"]);

export function sanitizeText(value, max = MAX_MESSAGE_LENGTH) {
  if (typeof value !== "string") {
    throw new AppError("VALIDATION_ERROR", "Le texte est invalide.", 400);
  }
  const text = value.replace(/\0/g, "").trim();
  if (!text) {
    throw new AppError("VALIDATION_ERROR", "Le message est vide.", 400);
  }
  if (text.length > max) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Le message dépasse ${max} caractères.`,
      400
    );
  }
  return text;
}

export function normalizeMessages(payload) {
  const { messages, message, conversation } = payload || {};
  const incoming = Array.isArray(messages)
    ? messages
    : [
        ...(Array.isArray(conversation) ? conversation : []),
        ...(typeof message === "string" ? [{ role: "user", content: message }] : [])
      ];

  if (!incoming.length) {
    throw new AppError("VALIDATION_ERROR", "La conversation est requise.", 400);
  }

  const safe = incoming
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const role = item.role;
      const text = item.text || item.content;
      return ALLOWED_ROLES.has(role) && typeof text === "string";
    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : item.role,
      content: String(item.text || item.content).slice(0, MAX_MESSAGE_LENGTH)
    }));

  if (!safe.length) {
    throw new AppError("VALIDATION_ERROR", "Aucun message valide.", 400);
  }

  return safe;
}

export function isBlankConversation(messages) {
  return !Array.isArray(messages) || messages.length === 0;
}
