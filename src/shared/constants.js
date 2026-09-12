export const APP_NAME = "L’univers d’amour";
export const MAX_MESSAGE_LENGTH = 3000;
// Contexte conversationnel étendu pour Amour AI.
export const MAX_HISTORY_MESSAGES = 200;
export const MAX_OUTPUT_TOKENS_DEFAULT = 900;
export const AI_TIMEOUT_DEFAULT = 30000;

// Capacité quotidienne élevée pour Amour AI.
export const FREE_DAILY_MESSAGES = 2500;
export const DAILY_REQUEST_LIMIT = 2500;
export const HOURLY_REQUEST_LIMIT = 300;

export const GUEST_ID_COOKIE = "lunivers_guest";

export const PLAN_LIMITS = {
  free: {
    dailyMessages: FREE_DAILY_MESSAGES,
    dailyRequests: DAILY_REQUEST_LIMIT,
    hourlyRequests: HOURLY_REQUEST_LIMIT,
    monthlyTokens: 80000,
    advancedGeneration: false,
    voiceFeatures: true,
    memoryEnabled: false,
    premiumModels: false,
    maxHistoryDays: 14
  },
  premium: {
    dailyMessages: 2500,
    dailyRequests: DAILY_REQUEST_LIMIT,
    hourlyRequests: HOURLY_REQUEST_LIMIT,
    monthlyTokens: 800000,
    advancedGeneration: true,
    voiceFeatures: true,
    memoryEnabled: true,
    premiumModels: true,
    maxHistoryDays: 365
  }
};

export const ALLOWED_LANGUAGES = ["fr", "en", "ar", "ha", "dje"];
export const DEFAULT_LANGUAGE = "fr";
