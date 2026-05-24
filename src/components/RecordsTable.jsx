import { useLayoutEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, LayoutGrid, Pencil, Table2, Trash2 } from "lucide-react";
import FormField from "./FormField.jsx";
import ConfirmActionDialog from "./ConfirmActionDialog.jsx";
import { Button } from "./ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.jsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip.jsx";
import { formatFieldValue, coerceCheckboxStored } from "../lib/fieldFormat.js";
import { copyRecordsTsvForSheets } from "../lib/recordsTsvExport.js";
import { normalizeExternalUrl } from "../lib/urlNormalize.js";
import { cn } from "../lib/utils.js";

/** Build editable draft keyed by field labels (matches live form shape). */
function recordDraftFromRecord(record, fields) {
  const d = {};
  for (const f of fields) {
    const raw = record[f.label];
    if (f.type === "checkbox") {
      d[f.label] = coerceCheckboxStored(raw);
    } else if (raw === undefined || raw === null) {
      d[f.label] = "";
    } else {
      d[f.label] = raw;
    }
  }
  return d;
}

function draftHasAnyAnswer(draft, fields) {
  return fields.some((f) => {
    const v = draft[f.label];
    if (f.type === "checkbox") return v === true;
    if (v === undefined || v === null) return false;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  });
}

function draftToStoredRecord(recordId, draft, fields) {
  const row = { recordId };
  for (const f of fields) {
    const v = draft[f.label];
    if (f.type === "checkbox") {
      row[f.label] = Boolean(v);
    } else {
      row[f.label] = v === undefined || v === null ? "" : v;
    }
  }
  return row;
}

function RecordCellContent({ field, raw }) {
  const display = formatFieldValue(field, raw);
  const baseMuted = "text-slate-500 dark:text-slate-400";

  if (display === "—") {
    return <span className={baseMuted}>{display}</span>;
  }

  if (field.type === "url") {
    const href = normalizeExternalUrl(String(raw ?? "").trim());
    if (!href)
      return <span className="line-clamp-2 break-words">{display}</span>;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="line-clamp-2 break-all text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        {String(raw).trim()}
      </a>
    );
  }

  if (field.type === "email") {
    const addr = String(raw).trim();
    return (
      <a href={`mailto:${addr}`} className="break-all text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
        {addr}
      </a>
    );
  }

  if (field.type === "tel") {
    const tel = String(raw).trim();
    return (
      <a href={`tel:${tel.replace(/\s/g, "")}`} className="tabular-nums text-emerald-700 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
        {tel}
      </a>
    );
  }

  return <span className="line-clamp-2 break-words">{display}</span>;
}

export default function RecordsTable({
  records,
  fields,
  embedded = false,
  setRecords,
  notify,
}) {
  const sectionTop = embedded ? "" : "mt-8";
  const panel =
    `${sectionTop} rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800/60`;

  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sheetView, setSheetView] = useState(false);

  const [copyBusy, setCopyBusy] = useState(false);

  const editingRowIndex = useMemo(() => {
    if (!editing) return -1;
    return records.findIndex((r) => r.recordId === editing.recordId);
  }, [editing, records]);

  useLayoutEffect(() => {
    if (!editing) return;
    setDraft(recordDraftFromRecord(editing, fields));
  }, [editing, fields]);

  const updateDraft = (label, value) => {
    setDraft((prev) => ({ ...prev, [label]: value }));
  };

  const saveEdit = () => {
    if (!editing || fields.length === 0) return;
    if (!draftHasAnyAnswer(draft, fields)) {
      notify?.("Answer at least one field before saving.", "error");
      return;
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.recordId === editing.recordId ? draftToStoredRecord(editing.recordId, draft, fields) : r,
      ),
    );
    notify?.("Record updated.", "success");
    setEditing(null);
  };

  const openGoogleSheet = () => {
    window.open("https://sheets.google.com/create", "_blank", "noopener,noreferrer");
  };

  const handleCopyForSheets = async () => {
    if (!records.length || !fields.length) return;
    if (!navigator.clipboard?.writeText) {
      notify?.("Clipboard is not available here. Use Export CSV from the builder area.", "error");
      return;
    }
    setCopyBusy(true);
    try {
      await copyRecordsTsvForSheets(fields, records);
      notify?.("Copied rows as tabs. Paste into cell A1 in Google Sheets (⌘V / Ctrl+V).", "success");
    } catch {
      notify?.("Could not copy. Try Export CSV, then File → Import in Google Sheets.", "error");
    } finally {
      setCopyBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.recordId;
    setRecords((prev) => prev.filter((r) => r.recordId !== id));
    notify?.("Record deleted.", "success");
    setDeleteTarget(null);
  };

  if (fields.length === 0) {
    return (
      <section className={`${panel} p-6 text-center`}>
        {!embedded ?
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Records</h2>
        : null}
        <p className={`text-sm text-slate-600 dark:text-slate-400 ${!embedded ? "" : "leading-relaxed"}`}>
          Add fields in the builder, submit a row, and saved answers will appear here.
        </p>
      </section>
    );
  }

  if (records.length === 0) {
    return (
      <section className={`${panel} p-8 text-center`}>
        {!embedded ?
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Records</h2>
        : null}
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No records yet — fill out the live form and use{" "}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">Save record</span>.
        </p>
      </section>
    );
  }

  const canMutateRecords = typeof setRecords === "function";

  return (
    <section className={`${panel} overflow-hidden`}>
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-600">
        <div className="min-w-0">
          {!embedded ?
            <>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Records</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {records.length} saved {records.length === 1 ? "record" : "records"}
              </p>
            </>
          : (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {records.length} saved {records.length === 1 ? "record" : "records"}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
          <div
            role="group"
            aria-label="Table layout"
            className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm dark:border-slate-600 dark:bg-slate-900"
          >
            <Button
              type="button"
              variant={sheetView ? "ghost" : "secondary"}
              size="sm"
              className="h-8 gap-1 px-2.5 font-medium"
              aria-pressed={!sheetView}
              onClick={() => setSheetView(false)}
              title="Comfortable rows"
            >
              <Table2 className="size-3.5 shrink-0" aria-hidden /> Table
            </Button>
            <Button
              type="button"
              variant={sheetView ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1 px-2.5 font-medium"
              aria-pressed={sheetView}
              onClick={() => setSheetView(true)}
              title="Dense grid similar to spreadsheets"
            >
              <LayoutGrid className="size-3.5 shrink-0" aria-hidden /> Sheet
            </Button>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5"
                aria-busy={copyBusy}
                disabled={copyBusy}
                title="Copies tabs + lines for paste into Sheets"
                onClick={() => handleCopyForSheets()}
              >
                <Copy className="size-3.5 shrink-0" aria-hidden /> Paste in Sheets
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[240px] text-pretty">
              Copy headers and rows using tabs; open Google Sheets and paste starting at{" "}
              <span className="font-semibold">A1</span>.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5"
                aria-label="Open new Google Sheet in a tab"
                onClick={openGoogleSheet}
              >
                <ExternalLink className="size-3.5 shrink-0" aria-hidden /> New sheet
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Opens sheets.google.com in a new tab</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div
        className={cn(
          "overflow-auto",
          sheetView ? "max-h-[min(70vh,520px)]" : "max-h-72",
        )}
      >
        <table
          className={cn(
            "w-full min-w-[280px] border-collapse text-left",
            sheetView ? "text-xs tabular-nums" : "text-sm",
          )}
        >
          <thead>
            <tr
              className={
                sheetView ?
                  "bg-emerald-100/90 dark:bg-emerald-950/50"
                : "bg-slate-100 dark:bg-slate-900/70"
              }
            >
              <th
                className={cn(
                  "border-b px-3 py-2 font-semibold text-slate-900 dark:text-slate-100",
                  sheetView ?
                    "sticky left-0 top-0 z-[3] min-w-[2.75rem] border-r border-emerald-200/80 bg-emerald-100/95 dark:border-emerald-800/70 dark:bg-emerald-950/55"
                  : "sticky top-0 z-[1] border-slate-200 bg-slate-100 dark:bg-slate-900/70 dark:border-slate-600",
                )}
              >
                #
              </th>
              {fields.map((field) => (
                <th
                  key={field.id}
                  className={cn(
                    "sticky top-0 z-[1] whitespace-nowrap border-b border-slate-200 px-3 py-2 font-semibold text-slate-900 dark:border-slate-600 dark:text-slate-100",
                    sheetView && "border-r border-slate-300/70 bg-emerald-100/90 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide dark:border-slate-600 dark:bg-emerald-950/50 dark:text-emerald-100",
                    sheetView ? "last:border-r-0" : null,
                  )}
                >
                  {field.label}
                </th>
              ))}
              {canMutateRecords ?
                <th
                  className={cn(
                    "sticky top-0 right-0 z-[2] whitespace-nowrap border-b border-slate-200 px-3 py-2 pl-4 font-semibold text-slate-900 dark:border-slate-600 dark:text-slate-100",
                    sheetView ?
                      "border-emerald-200/80 bg-emerald-100/95 dark:border-emerald-800/70 dark:bg-emerald-950/55 dark:text-emerald-100"
                    : "bg-slate-100 dark:bg-slate-900/70",
                  )}
                >
                  Actions
                </th>
              : null}
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr
                key={record.recordId}
                className="group border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700/35"
              >
                <td
                  className={cn(
                    "border-b tabular-nums text-slate-500 dark:border-slate-600 dark:text-slate-400",
                    sheetView ?
                      "sticky left-0 z-[1] border-r border-slate-200 bg-white px-2 py-1.5 dark:border-slate-600 dark:bg-slate-950"
                    : "border-slate-200 bg-white px-3 py-2 dark:bg-slate-950",
                    "group-hover:bg-slate-50 dark:group-hover:bg-slate-700/55",
                  )}
                >
                  {index + 1}
                </td>
                {fields.map((field) => (
                  <td
                    key={field.id}
                    className={cn(
                      "max-w-[min(260px,32vw)] border-b border-slate-200 text-slate-900 dark:border-slate-600 dark:text-slate-50",
                      sheetView ? "border-r px-2 py-1 text-[13px] last:border-r-0" : "px-3 py-2",
                    )}
                  >
                    <RecordCellContent field={field} raw={record[field.label]} />
                  </td>
                ))}
                {canMutateRecords ?
                  <td
                    className={cn(
                      "sticky right-0 z-[1] whitespace-nowrap border-b border-slate-200 py-1.5 pl-3 pr-2",
                      "bg-white group-hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:group-hover:bg-slate-700/50",
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-slate-600 hover:bg-slate-200/75 dark:text-slate-300 dark:hover:bg-slate-600/60"
                            aria-label={`Edit record ${index + 1}`}
                            onClick={() => setEditing(record)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit record</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-slate-600 hover:bg-slate-200/75 hover:text-red-700 dark:text-slate-300 dark:hover:bg-slate-600/60 dark:hover:text-red-400"
                            aria-label={`Delete record ${index + 1}`}
                            onClick={() => setDeleteTarget(record)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete record</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent
          className="max-h-[min(90vh,36rem)] overflow-y-auto sm:max-w-md"
          onInteractOutside={(e) => {
            const t = e.target;
            if (t instanceof Element && t.closest("[data-radix-popper-content-wrapper]")) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editingRowIndex >= 0 ? <>Edit record #{editingRowIndex + 1}</> : <>Edit record</>}
            </DialogTitle>
            <DialogDescription className="text-left text-pretty dark:text-slate-400">
              Update values for this saved row — the same layout as your form fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editing ?
              fields.map((field) => (
                <FormField
                  key={field.id}
                  id={`edit-record-${editing.recordId}-${field.id}`}
                  field={field}
                  value={draft[field.label]}
                  onChange={(v) => updateDraft(field.label, v)}
                />
              ))
            : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="button" variant="save" onClick={saveEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this record?"
        description="This permanently removes this row from your saved Records in this browser. Export first if you need a backup."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </section>
  );
}
