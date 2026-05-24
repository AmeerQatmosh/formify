import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.jsx";
import { coerceCheckboxStored } from "../lib/fieldFormat.js";
import { cn } from "../lib/utils.js";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-50 dark:placeholder:text-slate-400";

const LABEL_CLS =
  "mb-1 block text-left text-sm font-medium text-slate-800 dark:text-slate-200";

/** Sentinel so Radix Select always has a valid item value while meaning “unset”. */
const FORMIFY_SELECT_EMPTY = "__formify_empty__";

/** Renders one dynamic field — used by the builder, preview modal, etc. */
export default function FormField({ field, value, onChange, disabled, id, hideLabel = false, compact = false }) {
  const cid = id ?? `field-${field.id}`;
  const icls = cn(INPUT_CLS, hideLabel && "mt-0", compact && "px-2.5 py-1.5");
  const textareaRows = compact ? 2 : 3;

  switch (field.type) {
    case "textarea":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <textarea
            disabled={disabled}
            className={icls}
            id={cid}
            rows={textareaRows}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "checkbox": {
      const checked = coerceCheckboxStored(value);
      return (
        <div className={cn("flex items-center", compact ? "gap-2" : "gap-3 pt-1")}>
          <input
            type="checkbox"
            id={cid}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-400 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-slate-500"
            aria-label={field.label}
          />
          {!hideLabel ?
            <label htmlFor={cid} className={`${LABEL_CLS} cursor-pointer select-none`}>
              {field.label}
            </label>
          : null}
        </div>
      );
    }

    case "select": {
      const opts = field.options ?? [];
      let selected = FORMIFY_SELECT_EMPTY;
      const str = value === undefined || value === null ? "" : String(value);
      if (str !== "" && opts.includes(str)) selected = str;
      return (
        <div className={cn(hideLabel ? "space-y-0" : "space-y-1")}>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <Select
            disabled={disabled}
            value={selected}
            onValueChange={(v) => onChange(v === FORMIFY_SELECT_EMPTY ? "" : v)}
          >
            <SelectTrigger
              id={cid}
              className={cn("w-full", !hideLabel && "mt-0", compact && "h-9 py-1")}
              aria-label={hideLabel ? field.label : undefined}
            >
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value={FORMIFY_SELECT_EMPTY}>Choose…</SelectItem>
              {opts.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    case "number":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="number"
            disabled={disabled}
            className={icls}
            id={cid}
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "date":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="date"
            disabled={disabled}
            className={icls}
            id={cid}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "time":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="time"
            disabled={disabled}
            className={icls}
            id={cid}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "datetime":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="datetime-local"
            disabled={disabled}
            className={cn(icls, "min-h-11")}
            id={cid}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "email":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            disabled={disabled}
            className={icls}
            id={cid}
            placeholder="you@example.com"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "url":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="url"
            inputMode="url"
            autoComplete="url"
            disabled={disabled}
            className={icls}
            id={cid}
            placeholder="https://…"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "tel":
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            disabled={disabled}
            className={icls}
            id={cid}
            placeholder="+1 …"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );

    case "text":
    default:
      return (
        <div>
          {!hideLabel ?
            <label htmlFor={cid} className={LABEL_CLS}>
              {field.label}
            </label>
          : null}
          <input
            type="text"
            disabled={disabled}
            className={icls}
            id={cid}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={hideLabel ? field.label : undefined}
          />
        </div>
      );
  }
}
