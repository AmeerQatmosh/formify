import { FileJson, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/button.jsx";

export default function ExportButtons({
  disabled,
  onExportJson,
  onExportXlsx,
  onExportCsv,
  busy,
  /** When true: no long description (e.g. compact strip while builder hidden). */
  minimal = false,
}) {
  return (
    <div className="space-y-3">
      {!minimal && (
        <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">
          Download rows as JSON, Excel (.xlsx), or CSV — same columns as in Records.
        </p>
      )}
      {minimal && (
        <p className="text-slate-600 text-xs dark:text-slate-400">Exports for Records (shown while builder hidden):</p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="downloadJson"
          size="sm"
          disabled={disabled || busy === "json"}
          aria-busy={busy === "json"}
          onClick={() => onExportJson()}
        >
          {busy === "json" ?
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Preparing…
            </>
          : <>
              <FileJson aria-hidden /> JSON
            </>
          }
        </Button>
        <Button
          type="button"
          variant="downloadXlsx"
          size="sm"
          disabled={disabled || busy === "xlsx"}
          aria-busy={busy === "xlsx"}
          onClick={() => onExportXlsx()}
        >
          {busy === "xlsx" ?
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Preparing…
            </>
          : <>
              <FileSpreadsheet aria-hidden /> Excel (.xlsx)
            </>
          }
        </Button>
        <Button
          type="button"
          variant="downloadCsv"
          size="sm"
          disabled={disabled || busy === "csv"}
          aria-busy={busy === "csv"}
          onClick={() => onExportCsv()}
        >
          {busy === "csv" ?
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Preparing…
            </>
          : <>
              <FileText aria-hidden /> CSV
            </>
          }
        </Button>
      </div>
    </div>
  );
}
