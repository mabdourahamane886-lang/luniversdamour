import { handlePreflight, fail, ok, clientId } from "./_lib/http.js";
import { usageSnapshot } from "../src/services/usage-service.js";
import { getPlanLimits } from "../src/services/plan.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (request.method !== "GET") {
    return fail(response, 405, "METHOD_NOT_ALLOWED", "GET only");
  }
  return ok(response, {
    ...usageSnapshot(clientId(request)),
    limits: getPlanLimits({ plan: "free" }),
    premium: "Premium bientôt disponible"
  });
}
