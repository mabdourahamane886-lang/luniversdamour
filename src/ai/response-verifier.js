const MAX_RESPONSE_LENGTH = 7000;

function normalize(value) {
  return String(value || "").replace(/\r\n/g, "\n").trim();
}

export function verifyResponse(text) {
  const candidate = normalize(text);
  const issues = [];

  if (!candidate) issues.push("empty_response");
  if (candidate.length > MAX_RESPONSE_LENGTH) issues.push("response_too_long");
  if (/\[object Object\]/i.test(candidate)) issues.push("object_render_error");
  if (/^(undefined|null)$/i.test(candidate)) issues.push("invalid_scalar");
  if (/^[{\[]/.test(candidate) && /[}\]]$/.test(candidate)) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") issues.push("json_leaked_to_user");
    } catch (_) {
      // Plain text beginning with [ or { is allowed when it is not valid JSON.
    }
  }

  return {
    ok: issues.length === 0,
    text: candidate.slice(0, MAX_RESPONSE_LENGTH),
    issues
  };
}

export function repairResponse(text, fallbackText) {
  const checked = verifyResponse(text);
  if (checked.ok) return { ...checked, repaired: false };
  const fallback = normalize(fallbackText);
  return {
    ok: Boolean(fallback),
    text: fallback || "Je n'ai pas pu produire une réponse fiable pour le moment.",
    issues: checked.issues,
    repaired: true
  };
}
