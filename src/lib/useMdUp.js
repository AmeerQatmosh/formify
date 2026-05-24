import { useSyncExternalStore } from "react";

/** Desktop breakpoint aligned with Tailwind `md` (768px). */
export const MD_MEDIA = "(min-width: 768px)";

export function subscribeMinWidth(mdQuery, cb) {
  const mq = window.matchMedia(mdQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True when viewport is md or wider; client-only SSR snapshot is always false (SPA-safe). */
export function useMdUp() {
  return useSyncExternalStore(
    (onChange) => subscribeMinWidth(MD_MEDIA, onChange),
    () => window.matchMedia(MD_MEDIA).matches,
    () => false,
  );
}
