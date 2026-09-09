import { peekUsage } from "./plan.js";

export function usageSnapshot(userId) {
  return {
    userId,
    date: new Date().toISOString().slice(0, 10),
    messages_count: peekUsage(userId),
    storage: "ephemeral-instance"
  };
}
