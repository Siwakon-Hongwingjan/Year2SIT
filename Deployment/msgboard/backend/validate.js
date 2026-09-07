export const MAX_AUTHOR = 80;
export const MAX_BODY = 2000;

// Trust boundary: this is the only thing standing between the HTTP body and the DB.
export function validateMessage(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "body must be a JSON object" };
  }
  const author = typeof input.author === "string" ? input.author.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!author) return { ok: false, error: "author is required" };
  if (!body) return { ok: false, error: "body is required" };
  if (author.length > MAX_AUTHOR) return { ok: false, error: `author exceeds ${MAX_AUTHOR} characters` };
  if (body.length > MAX_BODY) return { ok: false, error: `body exceeds ${MAX_BODY} characters` };
  return { ok: true, value: { author, body } };
}
