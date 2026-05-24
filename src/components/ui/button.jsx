import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

/** Classic Formify palette: bright primaries + export row + three download greens. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-950 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer",
  {
    variants: {
      variant: {
        /** Add field — blue */
        default:
          "bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500",
        /** Save record — green */
        save:
          "bg-green-600 text-white shadow hover:bg-green-700 focus-visible:ring-green-500 dark:bg-green-600 dark:hover:bg-green-500",
        preview:
          "bg-fuchsia-600 text-white shadow hover:bg-fuchsia-700 focus-visible:ring-fuchsia-400 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-500",
        amberExport:
          "bg-amber-500 text-white shadow hover:bg-amber-600 focus-visible:ring-amber-400 dark:bg-amber-600 dark:hover:bg-amber-500",
        orangeImport:
          "bg-orange-500 text-white shadow hover:bg-orange-600 focus-visible:ring-orange-400 dark:bg-orange-600 dark:hover:bg-orange-500",
        /** Excel — dark teal */
        downloadXlsx:
          "bg-teal-800 text-white shadow hover:bg-teal-900 focus-visible:ring-teal-500 dark:bg-teal-700 dark:hover:bg-teal-600",
        /** CSV — emerald */
        downloadCsv:
          "bg-emerald-600 text-white shadow hover:bg-emerald-700 focus-visible:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500",
        /** JSON — bright mint */
        downloadJson:
          "bg-green-400 text-green-950 shadow hover:bg-green-300 focus-visible:ring-green-500 dark:bg-green-500 dark:text-white dark:hover:bg-green-400",
        muted:
          "bg-slate-800 text-white shadow hover:bg-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
        secondary:
          "border border-slate-300 bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        outline:
          "border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900",
        ghost:
          "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
        destructive:
          "bg-red-600 text-white shadow hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "size-9 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  );
});
Button.displayName = "Button";

export { Button };
