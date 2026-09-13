import { runAgent } from "./agent-service.js";
import { sanitizeText } from "../shared/validation.js";

export async function runGeneration({ payload, tool }) {
  return runAgent({ payload, tool });
}

export function optionalSanitize(text) {
  return sanitizeText(text);
}
