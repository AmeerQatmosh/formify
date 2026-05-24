import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.jsx";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-[240] bg-black/50 backdrop-blur-[1px]", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-1/2 left-1/2 z-[241] grid w-[calc(100%-2rem)] max-w-md gap-5 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:w-full",
        className,
      )}
      {...props}
    >
      <DialogPrimitive.Close asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 size-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2 pr-8 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-slate-600 text-sm dark:text-slate-400", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogPortal, DialogTitle, DialogTrigger };
