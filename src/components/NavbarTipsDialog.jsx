import { useState } from "react";
import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.jsx";
import { Button } from "./ui/button.jsx";
import { navBarIconButtonClass } from "../lib/navbarStyles.js";

const TIPS = [
  "On small screens, use Switch order and Hide builder in the top bar. Split/stack layout is available on wider screens.",
  "Drag fields by their handle to reorder. Each field menu can rename it, change its type (including email, URL, phone, date and time), or remove it.",
  "Save submissions from the form card; Records holds your table. Use Table vs Sheet density, Paste in Sheets to copy tab-separated rows into Google Sheets (paste at cell A1), or export CSV / Excel when the builder is hidden.",
  "Appearance sets light, dark, or system — the navbar icon shows your current choice.",
];

export default function NavbarTipsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Tips"
        title="Tips"
        className={navBarIconButtonClass(
          "!border-slate-300 bg-white hover:bg-slate-50 dark:!border-slate-600 dark:bg-slate-950 dark:hover:bg-slate-900",
        )}
        onClick={() => setOpen(true)}
      >
        <CircleHelp aria-hidden className="text-slate-600 dark:text-slate-400" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tips</DialogTitle>
            <DialogDescription className="text-left leading-relaxed dark:text-slate-400">
              Quick ways to get around Formify.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-3 py-2 pl-4 text-sm text-slate-700 dark:text-slate-300">
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
