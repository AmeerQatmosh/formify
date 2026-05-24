import { coerceCheckboxStored } from "./fieldFormat.js";

/** Escape a value for tab-separated paste into Google Sheets / Excel */
export function escapeTsvCell(value) {
  const s = value === undefined || value === null ? "" : String(value);
  if (/[\t\n\r"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function cellPlainForSheets(field, raw) {
  if (raw === undefined || raw === null || raw === "") return "";
  if (field.type === "checkbox") return coerceCheckboxStored(raw) ? "Yes" : "No";
  return String(raw);
}

/** Headers + rows, tab-separated and newline-terminated rows (RFC-style paste). */
export function buildRecordsTsv(fields, records) {
  const headerRow = fields.map((f) => escapeTsvCell(f.label)).join("\t");
  const dataRows = records.map((record) =>
    fields.map((f) => escapeTsvCell(cellPlainForSheets(f, record[f.label]))).join("\t"),
  );
  return [headerRow, ...dataRows].join("\n");
}

export async function copyRecordsTsvForSheets(fields, records) {
  const text = buildRecordsTsv(fields, records);
  await navigator.clipboard.writeText(text);
}
