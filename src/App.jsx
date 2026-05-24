import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useState } from "react";
import ExportButtons from "./components/ExportButtons.jsx";
import AppNavbar from "./components/AppNavbar.jsx";
import RecordsTable from "./components/RecordsTable.jsx";
import Toast from "./components/Toast.jsx";
import { TooltipProvider } from "./components/ui/tooltip.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card.jsx";
import { Separator } from "./components/ui/separator.jsx";
import { exportRecords } from "./lib/exportRecords.js";
import { cn } from "./lib/utils.js";

/** Fire FormBuilder chunk fetch as soon as the entry graph runs — avoids a late waterfall after React paints. */
const formBuilderImport = import("./components/FormBuilder.jsx");
const FormBuilder = lazy(() => formBuilderImport);

/** Small loading surface for Suspense — keeps layout stable until the form chunk loads */
function FormBuilderSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading form builder"
      className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/90 px-4 py-14 dark:border-slate-600 dark:bg-slate-900/55"
    >
      <span className="sr-only">Loading form builder.</span>
      <span aria-hidden className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
        Loading form builder…
      </span>
    </div>
  );
}

const STORAGE_RECORDS = "formify-records-v1";
const STORAGE_WORKSPACE = "formify-workspace";

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row, index) =>
      typeof row?.recordId === "string" && row.recordId.length > 8 ?
          row
        : { ...row, recordId: `retro-${Date.now()}-${index}` },
    );
  } catch {
    return [];
  }
}

function loadThemePreference() {
  try {
    const v = localStorage.getItem("formify-theme");
    if (v === "light" || v === "dark" || v === "system") return v;
    return v === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function loadWorkspacePrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_WORKSPACE);
    if (!raw) {
      return { layoutMode: "split", responsesFirst: false, builderOpen: true };
    }
    const o = JSON.parse(raw);
    const layoutMode = o.layoutMode === "stack" ? "stack" : "split";
    let responsesFirst = false;
    if (typeof o.responsesFirst === "boolean") {
      responsesFirst = o.responsesFirst;
    } else if (typeof o.formOnRight === "boolean") {
      responsesFirst = o.formOnRight;
    }
    const builderOpen = typeof o.builderOpen === "boolean" ? o.builderOpen : true;
    return { layoutMode, responsesFirst, builderOpen };
  } catch {
    return { layoutMode: "split", responsesFirst: false, builderOpen: true };
  }
}

export default function App() {
  const ws = loadWorkspacePrefs();
  const [records, setRecords] = useState(loadRecords);

  const [fields, setFields] = useState(() => {
    try {
      const saved = localStorage.getItem("formFields");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [themePreference, setThemePreference] = useState(loadThemePreference);
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const effectiveDark =
    themePreference === "system" ? systemDark : themePreference === "dark";

  const [layoutMode, setLayoutMode] = useState(ws.layoutMode);
  const [responsesFirst, setResponsesFirst] = useState(ws.responsesFirst);
  const [builderOpen, setBuilderOpen] = useState(ws.builderOpen);

  const [toast, setToast] = useState(null);
  const [exportBusy, setExportBusy] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const notify = useCallback((message, variant = "info") => {
    setToast({ message, variant });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      setSystemDark(mq.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", effectiveDark);
  }, [effectiveDark]);

  useEffect(() => {
    try {
      localStorage.setItem("formify-theme", themePreference);
    } catch {
      /* skip */
    }
  }, [themePreference]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_WORKSPACE,
        JSON.stringify({ layoutMode, responsesFirst, builderOpen }),
      );
    } catch {
      /* skip */
    }
  }, [layoutMode, responsesFirst, builderOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECORDS, JSON.stringify(records));
    } catch {
      /* quota / privacy mode — skip */
    }
  }, [records]);

  const runExport = async (format) => {
    if (records.length === 0) {
      notify("Save at least one record before exporting.", "error");
      return;
    }

    setExportBusy(format);
    try {
      await exportRecords(records, fields, format);
      notify("File download started.", "success");
    } catch {
      notify("Something went wrong while exporting.", "error");
    } finally {
      setExportBusy(null);
    }
  };

  const spreadsheetExport = {
    busy: exportBusy,
    disabled: records.length === 0,
    onExportJson: () => runExport("json"),
    onExportXlsx: () => runExport("xlsx"),
    onExportCsv: () => runExport("csv"),
  };

  const recordsCard = (
    <Card className="min-w-0 shrink border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="space-y-0 pb-4">
        <CardTitle>Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!builderOpen ?
          <>
            <ExportButtons
              disabled={records.length === 0}
              busy={exportBusy}
              minimal
              onExportJson={spreadsheetExport.onExportJson}
              onExportXlsx={spreadsheetExport.onExportXlsx}
              onExportCsv={spreadsheetExport.onExportCsv}
            />
            <Separator />
          </>
        : null}
        <RecordsTable records={records} fields={fields} embedded setRecords={setRecords} notify={notify} />
      </CardContent>
    </Card>
  );

  const formCard = (
    <Card className="min-w-0 shrink border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="space-y-0 pb-4">
        <CardTitle>Form</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 sm:p-6 sm:pt-2">
        <Suspense fallback={<FormBuilderSkeleton />}>
          <FormBuilder
            fields={fields}
            records={records}
            setFields={setFields}
            setRecords={setRecords}
            notify={notify}
            embedded
            spreadsheetExport={spreadsheetExport}
          />
        </Suspense>
      </CardContent>
    </Card>
  );

  /** In split mode at `lg`, panes share row width equally; stacked column never grows height via flex-1 (avoids overlapping cards). */
  const splitViewPaneCls =
    layoutMode === "split" && builderOpen ? "lg:flex-1 lg:basis-0 lg:min-h-0 lg:min-w-0 lg:shrink" : false;

  return (
    <TooltipProvider delayDuration={220}>
      <div className="relative min-h-screen bg-slate-100 pb-28 text-slate-900 antialiased transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <AppNavbar
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          responsesFirst={responsesFirst}
          setResponsesFirst={setResponsesFirst}
          builderOpen={builderOpen}
          setBuilderOpen={setBuilderOpen}
          themePreference={themePreference}
          setThemePreference={setThemePreference}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "mx-auto max-w-[1400px] px-4 pt-6 pb-10 outline-none sm:px-6 lg:px-10",
          )}
          aria-label="Workspace"
        >
          <div
            className={cn(
              "flex flex-col",
              layoutMode === "stack" && "mx-auto w-full max-w-3xl gap-8 lg:gap-10",
              layoutMode === "split" && "gap-10",
              layoutMode === "split" && builderOpen && "lg:flex-row lg:items-stretch lg:gap-12",
            )}
          >
            {!builderOpen ?
              <div className="min-h-0 w-full shrink-0">{recordsCard}</div>
            : responsesFirst ?
              <>
                <div className={cn("min-h-0 w-full shrink-0", splitViewPaneCls)}>{recordsCard}</div>
                <div className={cn("min-h-0 w-full shrink-0", splitViewPaneCls)}>{formCard}</div>
              </>
            : <>
                <div className={cn("min-h-0 w-full shrink-0", splitViewPaneCls)}>{formCard}</div>
                <div className={cn("min-h-0 w-full shrink-0", splitViewPaneCls)}>{recordsCard}</div>
              </>
            }
          </div>
        </main>
      </div>

      <Toast toast={toast} onClose={dismissToast} />
    </TooltipProvider>
  );
}
