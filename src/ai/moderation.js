const BLOCK_PATTERNS = [
  { code: "MINOR_SEXUAL", re: /\b(enfant|mineur|fillette|gamin).{0,40}(sexe|porn|nu[e]?)\b/i, message: "Je ne peux pas traiter ce type de demande." },
  { code: "VIOLENCE", re: /\b(tuer|assassiner|frapper fort|égorger|exploser)\b/i, message: "Je ne peux pas aider à la violence. Si vous êtes en danger, contactez les urgences locales." },
  { code: "REVENGE", re: /\b(vengeance|me venger|détruire sa réputation|doxx)\b/i, message: "Je n’encourage pas la vengeance. On peut parler d’une sortie respectueuse de la situation." },
  { code: "STALKING", re: /\b(stalk|surveiller son tel|pirater (son|le) (tel|téléphone|whatsapp|compte)|spyware|keylogger)\b/i, message: "Je ne peux pas aider à surveiller ou pirater quelqu’un. Le consentement et la vie privée comptent." },
  { code: "SELF_HARM", re: /\b(me suicider|me tuer|en finir avec la vie)\b/i, message: "Si vous êtes en danger, contactez immédiatement les urgences ou une personne de confiance. Je peux écouter, mais je ne remplace pas un professionnel." }
];

export function moderateContent(text) {
  const value = String(text || "");
  for (const rule of BLOCK_PATTERNS) {
    if (rule.re.test(value)) {
      return {
        allowed: false,
        code: rule.code,
        message: rule.message,
        crisis: rule.code === "SELF_HARM" || rule.code === "VIOLENCE"
      };
    }
  }
  return { allowed: true, code: "OK", message: "" };
}

export function looksLikeSecret(text) {
  return /\b(mot de passe|password|carte bancaire|iban|cvv)\b/i.test(text);
}
