import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/utils.js";

function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-slate-200 dark:bg-slate-700",
        orientation === "horizontal" ? "h-px w-full" : "h-full min-h-[1.25rem] w-px self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
