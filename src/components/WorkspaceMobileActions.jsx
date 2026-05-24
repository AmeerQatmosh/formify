import { ArrowLeftRight, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.jsx";
import { cn } from "../lib/utils.js";
import { navBarIconButtonClass } from "../lib/navbarStyles.js";

/**
 * Narrow viewports: icon-only controls (aligned with Tips / theme). Labels via tooltips & aria-label.
 */
export default function WorkspaceMobileActions({
  responsesFirst,
  setResponsesFirst,
  builderOpen,
  setBuilderOpen,
  className,
}) {
  const iconBtn = cn(
    navBarIconButtonClass(
      "!border-slate-300 bg-white hover:bg-slate-50 dark:!border-slate-600 dark:bg-slate-950 dark:hover:bg-slate-900",
    ),
    "disabled:pointer-events-none disabled:opacity-40 dark:disabled:hover:bg-slate-950",
  );

  return (
    <div
      role="toolbar"
      aria-label="Workspace"
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-xl border border-slate-200/90 bg-slate-100/60 p-0.5 dark:border-slate-600/70 dark:bg-slate-900/55 md:hidden",
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!builderOpen}
            className={iconBtn}
            aria-label={
              responsesFirst ? "Switch order — show form ahead of Records" : "Switch order — show Records ahead of form"
            }
            onClick={() => setResponsesFirst((v) => !v)}
          >
            <ArrowLeftRight aria-hidden className="text-slate-600 dark:text-slate-300" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] text-pretty">
          <span className="font-medium">Switch order</span>
          <span className="mt-1 block text-muted-foreground text-xs leading-snug opacity-95 dark:text-slate-400">
            {responsesFirst ?
              <>Form leads on small screens · wide split puts form on the left.</>
            : <>Records lead on small screens · wide split puts Records on the left.</>}
          </span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={iconBtn}
            aria-label={builderOpen ? "Hide form builder" : "Show form builder"}
            onClick={() => setBuilderOpen((o) => !o)}
          >
            {builderOpen ?
              <EyeOff aria-hidden className="text-slate-600 dark:text-slate-300" />
            : <Eye aria-hidden className="text-slate-600 dark:text-slate-300" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] text-pretty">
          <span className="font-medium">{builderOpen ? "Hide builder" : "Show builder"}</span>
          <span className="mt-1 block text-muted-foreground text-xs leading-snug opacity-95 dark:text-slate-400">
            {builderOpen ?
              <>Hides the form card and surfaces export shortcuts on Records.</>
            : <>Brings back the drag-and-drop form builder.</>}
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
