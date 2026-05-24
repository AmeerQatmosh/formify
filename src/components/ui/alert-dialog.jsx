import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.jsx";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[260] bg-black/50 backdrop-blur-[1px]",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-1/2 left-1/2 z-[261] grid w-[calc(100%-2rem)] max-w-md gap-5 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white px-6 py-7 text-slate-900 shadow-xl dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:w-full sm:rounded-xl",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-slate-600 text-sm leading-relaxed dark:text-slate-400", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel asChild>
    <Button ref={ref} type="button" variant="outline" className={className} {...props} />
  </AlertDialogPrimitive.Cancel>
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

const AlertDialogAction = React.forwardRef(({ className, variant = "save", destructive, ...props }, ref) => (
  <AlertDialogPrimitive.Action asChild>
    <Button
      ref={ref}
      type="button"
      variant={destructive ? "destructive" : variant}
      className={className}
      {...props}
    />
  </AlertDialogPrimitive.Action>
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
