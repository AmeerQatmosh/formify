import { FIELD_TYPES } from "./fieldTypes.js";

/** Import/export format for full restore: layout + responses. */

export const FORMIFY_BUNDLE_VERSION = 1;

const KNOWN_FIELD_TYPE_LIST = FIELD_TYPES.map(([value]) => value);
export const KNOWN_FIELD_TYPE_SET = new Set(KNOWN_FIELD_TYPE_LIST);
const ALLOWED_FIELD_DEF_KEYS = new Set(["id", "label", "type", "options"]);

function sanitizeField(field) {
  if (
    typeof field.label !== "string" ||
    !field.label.trim() ||
    typeof field.type !== "string"
  )
    throw new Error("Invalid structure");

  const id = typeof field.id === "string" && field.id ? field.id : crypto.randomUUID();

  const requestedType = typeof field.type === "string" ? field.type.trim() : "text";
  const type = KNOWN_FIELD_TYPE_SET.has(requestedType) ? requestedType : "text";

  let options = [];
  if (type === "select") {
    if (Array.isArray(field.options)) {
      options = field.options.filter((x) => typeof x === "string" && x.trim());
    } else if (typeof field.options === "string") {
      options = field.options.split(",").map((o) => o.trim()).filter(Boolean);
    }
  }

  return {
    id,
    label: field.label.trim(),
    type,
    options,
  };
}

export function sanitizeLayoutFields(importedFields) {
  if (!Array.isArray(importedFields)) throw new Error("Invalid format");
  return importedFields.map((field) => sanitizeField(field));
}

/** Rows that declare the form designer schema (arrays from “Export legacy layout”). */
function rowLooksLikeFieldDefinition(item) {
  if (!item || typeof item !== "object") return false;
  const keys = Object.keys(item);
  if (!(typeof item.label === "string" && item.label.trim())) return false;
  if (!(typeof item.type === "string" && KNOWN_FIELD_TYPE_SET.has(item.type))) return false;
  if (!keys.every((k) => ALLOWED_FIELD_DEF_KEYS.has(k))) return false;
  return true;
}

function isArrayOfFieldDefinitions(arr) {
  return Array.isArray(arr) && arr.length > 0 && arr.every(rowLooksLikeFieldDefinition);
}

/** Infer control type from a column’s non-empty samples (exported JSON may use real types; CSV is all strings). */
function inferColumnType(rows, columnKey) {
  const samples = [];
  for (const row of rows) {
    const v = row[columnKey];
    if (v === undefined || v === null || v === "") continue;
    samples.push(v);
  }
  if (samples.length === 0) return "text";

  if (
    samples.every(
      (v) =>
        v === true ||
        v === false ||
        String(v).toLowerCase() === "true" ||
        String(v).toLowerCase() === "false",
    )
  ) {
    return "checkbox";
  }

  if (
    samples.every(
      (v) =>
        typeof v === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()),
    )
  ) {
    return "email";
  }

  if (
    samples.every((v) => {
      if (typeof v !== "string") return false;
      const t = v.trim();
      return /^https?:\/\//i.test(t) || /^www\.[^\s]+$/i.test(t);
    })
  ) {
    return "url";
  }

  if (
    samples.every((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(v.trim()))
  ) {
    return "datetime";
  }

  if (
    samples.every((v) => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))))
  ) {
    const nums = samples.map((v) => Number(v));
    if (nums.every((n) => Number.isFinite(n))) return "number";
  }

  if (
    samples.every(
      (v) =>
        typeof v === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(v.trim()),
    )
  ) {
    return "date";
  }

  return "text";
}

/**
 * Builds field labels + types from arbitrary row objects (spreadsheet-like data).
 */
export function inferLayoutFromDataRows(rawRows) {
  if (!Array.isArray(rawRows)) throw new Error("Invalid format");

  const rows = rawRows.filter((r) => r && typeof r === "object" && !Array.isArray(r));
  const columnOrder = [];
  const seen = new Set(["recordId"]);

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key === "recordId") continue;
      if (!seen.has(key)) {
        seen.add(key);
        columnOrder.push(key);
      }
    }
  }

  if (columnOrder.length === 0) {
    throw new Error(
      "No columns found — use JSON objects with keys, a CSV/XLSX with a header row, or Formify bundle format.",
    );
  }

  const fields = columnOrder.map((label) => ({
    id: crypto.randomUUID(),
    label,
    type: inferColumnType(rows, label),
    options: [],
  }));

  const records = normalizeImportedRecords(rows, fields);
  return { fields, records };
}

/** Normalize saved rows to match current field labels and stable keys. */
export function normalizeImportedRecords(rawRecords, fields) {
  if (!Array.isArray(rawRecords)) return [];
  return rawRecords.map((row) => {
    if (!row || typeof row !== "object") throw new Error("Invalid record");

    const recordId =
      typeof row.recordId === "string" && row.recordId.length > 8 ?
        row.recordId
      : crypto.randomUUID();

    const data = {};
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(row, f.label)) data[f.label] = row[f.label];
    }

    return { recordId, ...data };
  });
}

function tryParseRecordTableObject(parsed) {
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    !Array.isArray(parsed.fields)
  ) {
    const list =
      Array.isArray(parsed.records) ?
        parsed.records
      : Array.isArray(parsed.data) ? parsed.data
      : Array.isArray(parsed.rows) ? parsed.rows
      : null;

    if (list && typeof list === "object") {
      try {
        return inferLayoutFromDataRows(list);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** One JSON object where every value is a primitive — treat as a single spreadsheet row (keys = column titles). */
function isFlatPrimitiveRecord(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
  if ("fields" in parsed || "formify" in parsed) return false;
  const keys = Object.keys(parsed);
  if (keys.length === 0) return false;
  return Object.values(parsed).every(
    (v) =>
      v === null ||
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean",
  );
}

/**
 * Parse Formify/text JSON — schema array, bundle, or data-table array/objects.
 */
export function parseFormifyImport(text) {
  const parsed = JSON.parse(text);

  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    Array.isArray(parsed.fields)
  ) {
    const fields = sanitizeLayoutFields(parsed.fields);
    const records = normalizeImportedRecords(
      Array.isArray(parsed.records) ? parsed.records : [],
      fields,
    );
    return { fields, records };
  }

  const inferred = tryParseRecordTableObject(parsed);
  if (inferred) return inferred;

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) throw new Error("Empty file.");

    if (isArrayOfFieldDefinitions(parsed)) {
      return {
        fields: sanitizeLayoutFields(parsed),
        records: [],
      };
    }

    const hasRecordLikeRows = parsed.every(
      (item) =>
        item && typeof item === "object" && !Array.isArray(item),
    );

    if (hasRecordLikeRows) {
      return inferLayoutFromDataRows(parsed);
    }

    throw new Error("Unsupported JSON structure.");
  }

  if (isFlatPrimitiveRecord(parsed)) {
    return inferLayoutFromDataRows([parsed]);
  }

  throw new Error("Unsupported JSON shape — expected table rows[], a bundle, or a record object keyed by column names.");
}

/** @deprecated Alias */
export const parseFormifyImportJson = parseFormifyImport;

export function buildFormifyBundle(fields, records = []) {
  return {
    formify: FORMIFY_BUNDLE_VERSION,
    fields,
    records: Array.isArray(records) ? records : [],
  };
}
