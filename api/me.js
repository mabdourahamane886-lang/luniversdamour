import { handlePreflight, fail, ok, readJson } from "./_lib/http.js";
import { guestProfile } from "../src/services/user-service.js";

export default async function handler(request, response) {
  if (handlePreflight(request, response)) return;

  if (request.method === "GET") {
    return ok(response, guestProfile(request));
  }

  if (request.method === "PATCH") {
    const body = await readJson(request).catch(() => ({}));
    const profile = guestProfile(request);
    return ok(response, {
      ...profile,
      user: {
        ...profile.user,
        preferred_language: body.preferred_language || profile.user.preferred_language,
        theme: body.theme || "light",
        consent_memory: Boolean(body.consent_memory)
      },
      persistence: "local"
    });
  }

  return fail(response, 405, "METHOD_NOT_ALLOWED", "Méthode non autorisée.");
}
