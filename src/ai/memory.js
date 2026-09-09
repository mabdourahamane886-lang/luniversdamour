import { looksLikeSecret } from "./moderation.js";

const FORBIDDEN = /\b(mot de passe|password|iban|cvv|carte bancaire|nss|sécurité sociale)\b/i;

export function canStoreMemory(text, consent) {
  if (!consent) return false;
  if (!text || text.length < 8) return false;
  if (FORBIDDEN.test(text) || looksLikeSecret(text)) return false;
  if (/\b(mineur|enfant de \d+)\b/i.test(text)) return false;
  return true;
}

export function redactForLogs(text) {
  return String(text || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\+?\d[\d\s.-]{7,}\d/g, "[tel]")
    .slice(0, 80);
}
