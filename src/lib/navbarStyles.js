import { cn } from "./utils.js";

/** One row height for navbar controls (helps / appearance / toolbar). */
export const NAV_BAR_H = "!h-10 max-h-10 shrink-0";

/** Outlined navbar control (labeled). */
export function navBarOutlineButtonClass(extra) {
  return cn(
    "inline-flex touch-manipulation items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-0 text-sm font-medium leading-none text-slate-900 shadow-sm",
    "hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
    NAV_BAR_H,
    extra,
  );
}

/** Square icon navbar control — matches `navBarOutlineButtonClass` row height exactly. */
export function navBarIconButtonClass(extra) {
  return cn(
    "inline-flex touch-manipulation items-center justify-center rounded-lg border border-slate-300 bg-white p-0 text-slate-900 shadow-sm",
    "hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
    "!h-10 !w-10 shrink-0 p-0",
    "[&_svg]:size-4 shrink-0",
    extra,
  );
}
