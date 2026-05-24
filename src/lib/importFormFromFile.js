import { inferLayoutFromDataRows, parseFormifyImport } from "./formifyBundle.js";

/** Split one CSV line (handles quoted fields). */
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        cur += "\"";
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function dedupeLabels(headers) {
  const count = {};
  return headers.map((raw, idx) => {
    const label = typeof raw === "string" ? raw.trim() : String(raw ?? "");
    const fallback = label || `Column ${idx + 1}`;
    count[fallback] = (count[fallback] || 0) + 1;
    const n = count[fallback];
    return n > 1 ? `${fallback} (${n})` : fallback;
  });
}

/** Convert CSV text to an array of plain row objects using the header row (row 1). */
export function csvTextToRecords(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error("CSV is empty.");

  const headerCells = parseCsvLine(lines[0]);
  if (headerCells.every((c) => c === "")) throw new Error("CSV needs a header row.");

  const headers = dedupeLabels(headerCells.map((h) => h.replace(/^"(.*)"$/, "$1")));
  const records = [];

  for (let ri = 1; ri < lines.length; ri++) {
    const cells = parseCsvLine(lines[ri]);
    if (cells.every((c) => c === "")) continue;

    const row = {};
    for (let ci = 0; ci < headers.length; ci++) {
      let v = cells[ci];
      if (typeof v === "string") v = v.replace(/^"(.*)"$/s, "$1");
      row[headers[ci]] = v ?? "";
    }
    records.push(row);
  }

  if (records.length === 0) {
    return {
      fields: headers.map((label) => ({
        id: crypto.randomUUID(),
        label,
        type: "text",
        options: [],
      })),
      records: [],
    };
  }

  return inferLayoutFromDataRows(records);
}

function coerceExcelCell(value) {
  if (value == null || value === "") return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && "text" in value) return coerceExcelCell(value.text);
  if (typeof value === "object" && value !== null && "result" in value) return coerceExcelCell(value.result);
  return value;
}

/** First sheet → header row → data rows → same inference as CSV/JSON rows. */
export async function workbookBufferToInferLayout(arrayBuffer) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("Excel workbook has no sheets.");

  const table = [];
  sheet.eachRow((row) => {
    const vals = row.values;
    if (!Array.isArray(vals)) return;
    table.push(vals.slice(1).map(coerceExcelCell));
  });

  if (table.length === 0) throw new Error("Spreadsheet appears empty.");

  const headerCells = table[0];
  const headers = dedupeLabels(
    headerCells.map((h, i) => (h !== "" && h != null ? String(h) : `Column ${i + 1}`)),
  );

  const plainRows = [];
  for (let ri = 1; ri < table.length; ri++) {
    const line = table[ri];
    if (line.every((c) => c === "" || c == null)) continue;
    const obj = {};
    for (let ci = 0; ci < headers.length; ci++) {
      obj[headers[ci]] = line[ci] ?? "";
    }
    plainRows.push(obj);
  }

  if (plainRows.length === 0) {
    return {
      fields: headers.map((label) => ({
        id: crypto.randomUUID(),
        label,
        type: "text",
        options: [],
      })),
      records: [],
    };
  }

  return inferLayoutFromDataRows(plainRows);
}

/**
 * JSON (text): schema, bundle, or table rows • CSV/XLSX: infer columns + responses.
 */
export async function importFormFromFile(file) {
  const name = (file.name || "").toLowerCase();

  if (name.endsWith(".xlsx")) {
    const buffer = await file.arrayBuffer();
    return workbookBufferToInferLayout(buffer);
  }

  if (name.endsWith(".csv")) {
    const text = await file.text();
    return csvTextToRecords(text);
  }

  const text = await file.text();
  return parseFormifyImport(text);
}
