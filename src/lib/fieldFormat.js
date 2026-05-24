/** Whether a checkbox should render checked (controlled input). Only explicit true — not arbitrary truthy strings. */
export function coerceCheckboxStored(raw) {
  if (raw === true) return true;
  if (raw === false || raw === undefined || raw === null || raw === "") return false;
  if (typeof raw === "string") return raw.trim().toLowerCase() === "true";
  return false;
}

export function formatFieldValue(field, raw) {
  if (raw === undefined || raw === null || raw === "") return "—";
  if (field.type === "checkbox") {
    return coerceCheckboxStored(raw) ? "Yes" : "No";
  }
  return String(raw);
}
