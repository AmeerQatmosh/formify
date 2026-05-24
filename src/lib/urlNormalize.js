/** Returns an https URL suitable for linking; prefixes https:// when the scheme is missing. */
export function normalizeExternalUrl(raw) {
  const s = typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  /* mailto:, tel:, etc. */
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
  return `https://${s}`;
}
