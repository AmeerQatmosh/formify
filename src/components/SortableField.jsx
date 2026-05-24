import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import FormField from "./FormField.jsx";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { FIELD_TYPES } from "../lib/fieldTypes.js";
import { cn } from "../lib/utils.js";

export default function SortableField({
  field,
  formData,
  onFieldChange,
  onRenameField,
  onChangeFieldType,
  onCommitSelectOptions,
  onRequestRemoveField,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  const [renameOpen, setRenameOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState(field.label);

  const [typeDraft, setTypeDraft] = useState(field.type);
  const [optionsDraft, setOptionsDraft] = useState(() => field.options?.join(", ") ?? "");

  useEffect(() => {
    if (renameOpen) setRenameDraft(field.label);
  }, [renameOpen, field.label]);

  useEffect(() => {
    if (!editOpen) return;
    setTypeDraft(field.type);
    setOptionsDraft(field.options?.join(", ") ?? "");
  }, [editOpen, field.id, field.type, field.options]);

  const typeLabel = FIELD_TYPES.find(([v]) => v === field.type)?.[1] ?? field.type;

  const saveRename = () => {
    const ok = onRenameField(field.id, renameDraft.trim());
    if (ok) setRenameOpen(false);
  };

  const saveEdit = () => {
    if (typeDraft !== field.type) {
      onChangeFieldType(field.id, typeDraft);
    }
    if (typeDraft === "select") {
      const parts = optionsDraft.split(",").map((o) => o.trim()).filter(Boolean);
      onCommitSelectOptions(field.id, parts);
    }
    setEditOpen(false);
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-50 dark:placeholder:text-slate-400";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2 py-2 dark:border-slate-500 dark:bg-slate-800/85 sm:px-2.5 sm:py-2.5",
        isDragging && "z-10 ring-2 ring-blue-500/40 shadow-md dark:ring-blue-400/35",
      )}
    >
      <div className="flex gap-1 sm:gap-1.5">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "mt-0.5 size-auto shrink-0 cursor-grab touch-none rounded-md p-1 ring-blue-500/40 active:cursor-grabbing",
            "text-slate-400 hover:bg-slate-200/60 hover:text-slate-700",
            "dark:text-slate-500 dark:hover:bg-slate-700/55 dark:hover:text-slate-200",
            "focus-visible:ring-2",
          )}
          aria-label={`Drag to reorder: ${field.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden strokeWidth={2} />
        </Button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">{field.label}</h3>
              <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">{typeLabel}</p>
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-slate-500 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50"
                  aria-label={`Actions for ${field.label}`}
                >
                  <MoreHorizontal className="size-4" aria-hidden strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6}>
                <DropdownMenuItem className="gap-2" onSelect={() => setRenameOpen(true)}>
                  <Pencil className="size-4 shrink-0 opacity-70" aria-hidden />
                  Rename…
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onSelect={() => setEditOpen(true)}>
                  <SlidersHorizontal className="size-4 shrink-0 opacity-70" aria-hidden />
                  Type & choices…
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  className="gap-2 focus:text-red-800 dark:focus:text-red-300"
                  onSelect={() => {
                    queueMicrotask(() => onRequestRemoveField(field));
                  }}
                >
                  <Trash2 className="size-4 shrink-0 opacity-80" aria-hidden />
                  Delete field…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border-t border-slate-200 pt-2 dark:border-slate-600">
            <p className="mb-1 text-[10px] font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
              Preview answer
            </p>
            <FormField
              id={`live-field-${field.id}`}
              compact
              hideLabel
              field={field}
              value={formData[field.label]}
              onChange={(v) => onFieldChange(field.label, v)}
            />
          </div>
        </div>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="gap-6">
          <DialogHeader>
            <DialogTitle>Rename field</DialogTitle>
            <DialogDescription>
              Updating the label renames this column everywhere — including saved Records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor={`rename-${field.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Field name
            </label>
            <input
              id={`rename-${field.id}`}
              autoComplete="off"
              autoFocus
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              className={inputCls}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="save" className="w-full sm:w-auto" onClick={saveRename}>
              Save name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="gap-6">
          <DialogHeader>
            <DialogTitle>Edit type & choices</DialogTitle>
            <DialogDescription>Switching types clears only the preview answer box so you can re-enter a value.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor={`dlg-type-${field.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Field type
              </label>
              <Select value={typeDraft} onValueChange={setTypeDraft}>
                <SelectTrigger id={`dlg-type-${field.id}`} className="h-11 w-full">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={6} className="z-[245]">
                  {FIELD_TYPES.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {typeDraft === "select" && (
              <div className="space-y-2">
                <label htmlFor={`dlg-options-${field.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Dropdown choices (comma-separated)
                </label>
                <input
                  id={`dlg-options-${field.id}`}
                  autoComplete="off"
                  placeholder="Small, Medium, Large"
                  value={optionsDraft}
                  onChange={(e) => setOptionsDraft(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="save" className="w-full sm:w-auto" onClick={saveEdit}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
