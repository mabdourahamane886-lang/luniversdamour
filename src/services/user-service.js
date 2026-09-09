import { getPlanLimits } from "./plan.js";

export function guestProfile(request) {
  const language = request.headers["accept-language"]?.slice(0, 2) || "fr";
  const user = {
    id: "guest",
    role: "guest",
    plan: "free",
    premiumActive: false,
    preferred_language: language === "en" ? "en" : "fr",
    consent_memory: false
  };
  return { user, limits: getPlanLimits(user) };
}
