import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils.js";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 shadow-sm outline-none transition",
      "focus-visible:ring-2 focus-visible:ring-blue-500/50",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "dark:border-slate-500 dark:bg-slate-700 dark:text-slate-50",
      "[&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        /** Above Dialog (241) so portaled menus work inside modals; below AlertDialog (≥260). */
        "z-[250] max-h-[min(18rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-lg",
        "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "w-full")}>{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pr-8 pl-2 text-sm outline-none",
      "focus:bg-slate-100 focus:text-slate-900",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "dark:focus:bg-slate-700 dark:focus:text-slate-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-4 shrink-0 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("mx-1 my-1 h-px bg-slate-200 dark:bg-slate-600", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue };
