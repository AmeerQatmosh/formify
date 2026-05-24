import { useState, useEffect, useRef } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CirclePlus, Download, Eye, Save, Trash2, Upload, X } from "lucide-react";
import SortableField from "./SortableField.jsx";
import FormField from "./FormField.jsx";
import ExportButtons from "./ExportButtons.jsx";
import { Button } from "./ui/button.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { buildFormifyBundle } from "../lib/formifyBundle.js";
import { renameLabelInRows, dropLabelFromRows } from "../lib/fieldDataset.js";
import { FIELD_TYPES } from "../lib/fieldTypes.js";
import { importFormFromFile } from "../lib/importFormFromFile.js";
import { cn } from "../lib/utils.js";
import ConfirmActionDialog from "./ConfirmActionDialog.jsx";

const INPUT_CLS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-50 dark:placeholder:text-slate-400";

const borderedCard = "border-slate-200 bg-white dark:border-slate-600 dark:bg-gray-800/70";

export default function FormBuilder({
  fields,
  setFields,
  setRecords,
  records = [],
  notify,
  embedded = false,
  /** Spreadsheet downloads for saved rows ({ busy, disabled, callbacks }). */
  spreadsheetExport,
}) {
  const layoutImportRef = useRef(null);
  const [newField, setNewField] = useState({ label: "", type: "text", options: "" });
  const [formData, setFormData] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    localStorage.setItem("formFields", JSON.stringify(fields));
  }, [fields]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  useEffect(() => {
    if (!showPreview) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowPreview(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPreview]);

  const addField = () => {
    if (!newField.label.trim()) {
      notify("Please enter a label for the field.", "error");
      return;
    }

    const options =
      newField.type === "select"
        ? newField.options.split(",").map((o) => o.trim()).filter(Boolean)
        : [];

    const newFieldData = { id: crypto.randomUUID(), ...newField, options };

    setFields((prev) => [...prev, newFieldData]);
    setNewField({ label: "", type: "text", options: "" });
    notify("Field added.", "success");
  };

  const onFieldChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const saveRecord = () => {
    if (fields.length === 0) {
      notify("Add at least one field before saving.", "error");
      return;
    }

    const answered = fields.some((f) => {
      const v = formData[f.label];
      if (f.type === "checkbox") return v === true;
      if (v === undefined || v === null) return false;
      if (typeof v === "string") return v.trim() !== "";
      return true;
    });

    if (!answered) {
      notify("Answer at least one field before saving.", "error");
      return;
    }

    setRecords((prev) => [...prev, { recordId: crypto.randomUUID(), ...formData }]);
    setFormData({});
    notify("Record saved.", "success");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((prevFields) => {
      const oldIndex = prevFields.findIndex((field) => field.id === active.id);
      const newIndex = prevFields.findIndex((field) => field.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prevFields;
      return arrayMove(prevFields, oldIndex, newIndex);
    });
  };

  const exportForm = () => {
    if (fields.length === 0) {
      notify("There is no form layout to export yet.", "error");
      return;
    }

    try {
      const payload = buildFormifyBundle(fields, records);
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "formify-form.json";
      link.click();
      URL.revokeObjectURL(link.href);
      notify(
        records.length ?
          `Form exported (${fields.length} fields, ${records.length} record${records.length === 1 ? "" : "s"}).`
        : `Form exported (${fields.length} fields). Records are included when you have saved rows.`,
        "success",
      );
    } catch {
      notify("Could not export the form.", "error");
    }
  };

  const importForm = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { fields: nextFields, records: nextRecords } = await importFormFromFile(file);
      setFields(nextFields);
      setRecords(nextRecords);
      setFormData({});
      notify(
        nextRecords.length ?
          `Built ${nextFields.length} column${nextFields.length === 1 ? "" : "s"} from the file and loaded ${nextRecords.length} row${nextRecords.length === 1 ? "" : "s"} into Records.`
        : `Built ${nextFields.length} column${nextFields.length === 1 ? "" : "s"} from the file (no data rows yet).`,
        "success",
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not import that file.", "error");
    } finally {
      if (layoutImportRef.current) layoutImportRef.current.value = "";
    }
  };

  const performClearAll = () => {
    setFields([]);
    setRecords([]);
    localStorage.removeItem("formFields");
    setFormData({});
    notify("Form layout and Records cleared.", "info");
  };

  const renameFieldById = (fieldId, nextLabel) => {
    const trimmed = nextLabel.trim();
    if (!trimmed) {
      notify("Field name cannot be empty.", "error");
      return false;
    }
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return false;
    if (field.label === trimmed) return true;
    if (fields.some((f) => f.id !== fieldId && f.label === trimmed)) {
      notify("Another field already uses that label.", "error");
      return false;
    }
    const old = field.label;
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, label: trimmed } : f)));
    setFormData((prev) => {
      if (!(old in prev)) return prev;
      const n = { ...prev };
      n[trimmed] = n[old];
      delete n[old];
      return n;
    });
    setRecords((prev) => renameLabelInRows(prev, old, trimmed));
    notify("Field renamed.", "success");
    return true;
  };

  const changeFieldTypeById = (fieldId, newType) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || field.type === newType) return;
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        return {
          ...f,
          type: newType,
          options: newType === "select" ? (f.options?.length ? f.options : []) : [],
        };
      }),
    );
    setFormData((prev) => {
      const n = { ...prev };
      delete n[field.label];
      return n;
    });
    notify("Field type updated. Re-enter the answer below if needed.", "info");
  };

  const commitSelectOptionsById = (fieldId, options) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, options } : f)));
  };

  const removeFieldById = (fieldId) => {
    const victim = fields.find((f) => f.id === fieldId);
    if (!victim) return;
    const { label } = victim;
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    setFormData((prev) => {
      const n = { ...prev };
      delete n[label];
      return n;
    });
    setRecords((prev) => dropLabelFromRows(prev, label));
    notify("Field removed.", "success");
  };

  const requestRemoveField = (field) => {
    setConfirm({ kind: "removeField", fieldId: field.id, label: field.label });
  };

  const openClearAllConfirm = () => {
    setConfirm({ kind: "clearAll" });
  };

  return (
    <div
      className={cn(
        !embedded && "rounded-xl border p-5 shadow-sm md:p-6",
        !embedded && borderedCard,
        embedded && "rounded-lg px-4 py-3 sm:p-6",
      )}
    >
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="new-label" className="sr-only">
              Field label
            </label>
            <input
              id="new-label"
              type="text"
              placeholder="Field label"
              autoComplete="off"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label htmlFor="new-type" className="sr-only">
              Field type
            </label>
            <Select
              value={newField.type}
              onValueChange={(type) => setNewField({ ...newField, type })}
            >
              <SelectTrigger id="new-type" className="w-full">
                <SelectValue placeholder="Field type" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {FIELD_TYPES.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {newField.type === "select" && (
          <div>
            <label htmlFor="new-options" className="sr-only">
              Dropdown options
            </label>
            <input
              id="new-options"
              type="text"
              placeholder="Dropdown options — comma separated (e.g. Small, Medium, Large)"
              value={newField.options}
              onChange={(e) => setNewField({ ...newField, options: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
        )}

        <Button type="button" variant="default" onClick={addField} className="h-11 w-full text-sm font-semibold">
          <CirclePlus aria-hidden /> Add field
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="mt-6 rounded-lg bg-slate-50 py-10 text-center text-sm text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
          No fields yet — add labels above to build your live form.
        </p>
      ) : (
        <>
          <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">Live form</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="mt-2 space-y-2">
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    formData={formData}
                    onFieldChange={onFieldChange}
                    onRenameField={renameFieldById}
                    onChangeFieldType={changeFieldTypeById}
                    onCommitSelectOptions={commitSelectOptionsById}
                    onRequestRemoveField={requestRemoveField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="save"
          onClick={saveRecord}
          disabled={fields.length === 0}
          className="h-11 flex-1 text-sm font-semibold"
        >
          <Save aria-hidden /> Save record
        </Button>
        <Button
          type="button"
          variant="preview"
          disabled={fields.length === 0}
          onClick={() => setShowPreview(true)}
          className="h-11 flex-1 text-sm font-semibold"
        >
          <Eye aria-hidden /> Preview
        </Button>
      </div>

      {spreadsheetExport ?
        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-600">
          <p className="mb-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Download records (spreadsheet)
          </p>
          <ExportButtons
            disabled={spreadsheetExport.disabled}
            busy={spreadsheetExport.busy}
            onExportJson={spreadsheetExport.onExportJson}
            onExportXlsx={spreadsheetExport.onExportXlsx}
            onExportCsv={spreadsheetExport.onExportCsv}
            minimal={false}
          />
        </div>
      : null}

      <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-8 dark:border-slate-600">
        <p className="mb-2 w-full text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          Backup layout &amp; reset
        </p>
        <Button type="button" variant="amberExport" size="sm" onClick={exportForm} disabled={fields.length === 0}>
          <Download aria-hidden /> Export form (JSON)
        </Button>
        <input
          ref={layoutImportRef}
          type="file"
          accept=".json,.JSON,.csv,.CSV,.xlsx,.XLSX,application/json,text/csv,.txt"
          onChange={importForm}
          className="hidden"
          id="import-layout"
        />
        <Button variant="orangeImport" size="sm" asChild className="cursor-pointer">
          <label
            htmlFor="import-layout"
            /* Reset before the picker opens so choosing the same file again still fires change. */
            onMouseDown={() => {
              if (layoutImportRef.current) layoutImportRef.current.value = "";
            }}
          >
            <Upload aria-hidden /> Import data / form
          </label>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={openClearAllConfirm}
          disabled={fields.length === 0 && records.length === 0}
        >
          <Trash2 aria-hidden /> Clear all
        </Button>
      </div>

      {confirm ?
        <ConfirmActionDialog
          open
          onOpenChange={(openNext) => {
            if (!openNext) setConfirm(null);
          }}
          title={confirm.kind === "clearAll" ? "Clear form and Records?" : `Remove field “${confirm.label}”?`}
          description={
            confirm.kind === "clearAll" ?
              "Every field and every saved record in this browser will be erased. You can restore from an exported bundle by importing again."
            : "This removes the column from the form and deletes its values from all Records. You can’t undo this here."
          }
          cancelLabel="Cancel"
          confirmLabel={confirm.kind === "clearAll" ? "Clear everything" : "Remove field"}
          destructive
          onConfirm={() => {
            if (confirm.kind === "clearAll") performClearAll();
            else removeFieldById(confirm.fieldId);
            setConfirm(null);
          }}
        />
      : null}

      {showPreview && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setShowPreview(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            className="max-h-[85vh] w-full max-w-md overflow-auto rounded-xl bg-white p-6 text-slate-900 shadow-xl dark:bg-gray-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="preview-title" className="text-lg font-semibold">
              Preview
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Static preview — Escape or click outside to close.</p>
            <div className="mt-5 space-y-4">
              {fields.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Nothing to preview.</p>
              ) : (
                fields.map((field) => (
                  <FormField
                    key={field.id}
                    id={`preview-field-${field.id}`}
                    field={field}
                    value=""
                    onChange={() => {}}
                    disabled
                  />
                ))
              )}
            </div>
            <Button type="button" variant="muted" className="mt-6 h-11 w-full font-medium" onClick={() => setShowPreview(false)}>
              <X aria-hidden /> Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
