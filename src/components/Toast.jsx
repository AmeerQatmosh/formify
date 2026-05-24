import { useEffect } from "react";

const styles = {
  success: "bg-emerald-700 text-white",
  error: "bg-red-700 text-white",
  info: "bg-slate-800 text-white",
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast?.message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto fixed bottom-6 left-1/2 z-[200] max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-sm shadow-lg ${styles[toast.variant] ?? styles.info}`}
    >
      {toast.message}
    </div>
  );
}
