import { forwardRef } from "react";
import { ArrowLeftRight, Columns2, Eye, EyeOff, Rows3 } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Separator } from "./ui/separator.jsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.jsx";
import { cn } from "../lib/utils.js";
import { navBarOutlineButtonClass } from "../lib/navbarStyles.js";

/** Light capsule + inset toggles (matches earlier design, avoids gray “track”). */
const segmentOuter =
  "flex h-10 max-h-10 shrink-0 items-stretch gap-0.5 rounded-xl border border-slate-300 bg-white p-0.5 shadow-sm dark:border-slate-600 dark:bg-slate-950 sm:gap-1 sm:p-1";

const SegmentTab = forwardRef(function SegmentTab(
  {
    active,
    onClick,
    "aria-label": ariaLabel,
    "aria-pressed": ariaPressed,
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      onClick={onClick}
      className={cn(
        "h-full min-h-0 flex-1 touch-manipulation gap-1.5 rounded-md border px-2 py-0 text-xs font-medium sm:flex-none sm:gap-2 sm:rounded-lg sm:px-3 sm:text-sm",
        active ?
          "border-slate-300 bg-slate-100 text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
        : "border-transparent text-slate-600 shadow-none hover:border-slate-200/90 hover:bg-slate-50 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-900/85 dark:hover:text-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
});

SegmentTab.displayName = "SegmentTab";

/**
 * Workspace layout switches — shown from `md` up; aligns with Navbar appearance height.
 */
export default function WorkspaceControls({
  layoutMode,
  setLayoutMode,
  responsesFirst,
  setResponsesFirst,
  builderOpen,
  setBuilderOpen,
  className,
}) {
  const outlineAction = navBarOutlineButtonClass(
    cn(
      "justify-center gap-2.5 whitespace-nowrap px-3.5 font-medium shadow-sm dark:bg-slate-950 dark:hover:bg-slate-900 dark:!border-slate-600",
      "[&>svg]:shrink-0",
    ),
  );

  return (
    <div
      className={cn("flex min-w-0 flex-nowrap items-center gap-2 sm:gap-3", className)}
      role="toolbar"
      aria-label="Workspace layout"
    >
      <div className={segmentOuter}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SegmentTab
              active={layoutMode === "split"}
              aria-label="Split view"
              aria-pressed={layoutMode === "split"}
              onClick={() => setLayoutMode("split")}
            >
              <Columns2 className="size-3.5 shrink-0 sm:size-4" aria-hidden />
              <span className="hidden xl:inline">Split view</span>
              <span className="hidden sm:inline xl:hidden">Split</span>
            </SegmentTab>
          </TooltipTrigger>
          <TooltipContent>Two columns from the large breakpoint — swap sides with “Switch order”.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <SegmentTab
              active={layoutMode === "stack"}
              aria-label="Stacked layout"
              aria-pressed={layoutMode === "stack"}
              onClick={() => setLayoutMode("stack")}
            >
              <Rows3 className="size-3.5 shrink-0 sm:size-4" aria-hidden />
              <span className="hidden sm:inline">Stacked</span>
            </SegmentTab>
          </TooltipTrigger>
          <TooltipContent>
            Comfortable single column centered on wider screens — form leads by default.
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="hidden h-8 w-[1px] shrink-0 self-center bg-slate-200 sm:block dark:bg-slate-700" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={!builderOpen}
            className={cn(outlineAction, "disabled:pointer-events-none disabled:opacity-50")}
            aria-label={responsesFirst ? "Place form ahead of Records" : "Place Records ahead of form"}
            onClick={() => setResponsesFirst((v) => !v)}
          >
            <ArrowLeftRight className="size-4 opacity-70" aria-hidden />
            Switch order
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {responsesFirst ?
            <>Records card leads (split: left · stacked: first).</>
          : <>Form card leads.</>}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={outlineAction}
            aria-label={builderOpen ? "Hide builder" : "Show builder"}
            onClick={() => setBuilderOpen((o) => !o)}
          >
            {builderOpen ?
              <>
                <EyeOff className="size-4 opacity-70" aria-hidden />
                Hide builder
              </>
            : <>
                <Eye className="size-4 opacity-70" aria-hidden />
                Show builder
              </>
            }
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {builderOpen ?
            <>Spreadsheet shortcuts show above Records until you reveal the builder again.</>
          : <>Reveal the form builder.</>}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
