import { Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.jsx";
import { Button } from "./ui/button.jsx";
import { cn } from "../lib/utils.js";
import { navBarOutlineButtonClass } from "../lib/navbarStyles.js";

function ThemeTriggerIcon({ themePreference }) {
  const cls = "size-4 shrink-0 text-slate-700 dark:text-slate-300 sm:size-[1.125rem]";
  if (themePreference === "dark") return <Moon aria-hidden className={cls} />;
  if (themePreference === "system") return <Monitor aria-hidden className={cls} />;
  return <Sun aria-hidden className={cls} />;
}

export default function NavbarAppearanceMenu({ themePreference, setThemePreference }) {
  const modeLabel =
    themePreference === "dark" ? "Dark"
    : themePreference === "system" ? "System"
    : "Light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Color theme: ${modeLabel}`}
          className={cn(
            navBarOutlineButtonClass(
              "!border-slate-300 shadow-sm dark:!border-slate-600 dark:bg-slate-900/80 dark:hover:bg-slate-900",
            ),
            "gap-2 max-md:!h-10 max-md:!max-h-10 max-md:!w-10 max-md:!min-w-10 max-md:!px-0 md:!w-auto md:min-w-0 md:!px-3",
          )}
        >
          <ThemeTriggerIcon themePreference={themePreference} />
          <span className="hidden font-medium md:inline">{modeLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Color theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={themePreference}
          onValueChange={(v) => {
            if (v === "light" || v === "dark" || v === "system") setThemePreference(v);
          }}
        >
          <DropdownMenuRadioItem value="light" className="gap-2 pl-8">
            <Sun className="size-4 opacity-70" aria-hidden />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="gap-2 pl-8">
            <Moon className="size-4 opacity-70" aria-hidden />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="gap-2 pl-8">
            <Monitor className="size-4 opacity-70" aria-hidden />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
