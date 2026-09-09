import { handlePreflight, fail, ok, requireAdmin } from "../_lib/http.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;
  if (!requireAdmin(request)) {
    return fail(response, 403, "FORBIDDEN", "Accès admin refusé.");
  }
  return ok(response, { users: [], persistence: "none" });
}
