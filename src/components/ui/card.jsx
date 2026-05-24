import * as React from "react";
import { cn } from "../../lib/utils.js";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-2 p-6 pb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-slate-500 text-sm dark:text-slate-400", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
