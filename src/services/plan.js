import { PLAN_LIMITS } from "../shared/constants.js";

export function getPlanLimits(user = {}) {
  const plan = user.plan === "premium" && user.premiumActive ? "premium" : "free";
  return { plan, ...PLAN_LIMITS[plan] };
}

const buckets = new Map();

export function consumeDailyQuota(userId, limit) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${userId}:${day}`;
  const current = buckets.get(key) || 0;
  if (current >= limit) {
    return { allowed: false, used: current, limit };
  }
  buckets.set(key, current + 1);
  return { allowed: true, used: current + 1, limit };
}

export function peekUsage(userId) {
  const day = new Date().toISOString().slice(0, 10);
  return buckets.get(`${userId}:${day}`) || 0;
}
