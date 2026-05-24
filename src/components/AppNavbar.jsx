import { Suspense, lazy } from "react";
import WorkspaceMobileActions from "./WorkspaceMobileActions.jsx";
import NavbarAppearanceMenu from "./NavbarAppearanceMenu.jsx";
import NavbarTipsDialog from "./NavbarTipsDialog.jsx";
import { cn } from "../lib/utils.js";
import { useMdUp } from "../lib/useMdUp.js";

const WorkspaceControls = lazy(() => import("./WorkspaceControls.jsx"));

/** Logo in `public/images`. SVG keeps weight low; respects Vite `base` (e.g. /formify/). */
const LOGO_SRC = `${import.meta.env.BASE_URL}images/formifyLogo.svg`;

export default function AppNavbar({
  layoutMode,
  setLayoutMode,
  responsesFirst,
  setResponsesFirst,
  builderOpen,
  setBuilderOpen,
  themePreference,
  setThemePreference,
}) {
  const mdUp = useMdUp();

  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-none transition-colors md:backdrop-blur-md",
        "border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/40",
        "dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-black/20",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1400px] items-center gap-x-3 gap-y-2 px-3 py-2 sm:gap-x-4 sm:px-4",
          "md:h-14 md:justify-between md:py-0 md:gap-x-3 lg:h-16 lg:px-10",
        )}
      >
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <img
            src={LOGO_SRC}
            alt="Formify"
            width={40}
            height={40}
            className="size-9 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80 sm:size-10 sm:rounded-2xl dark:ring-slate-600/80"
            decoding="async"
            fetchPriority="high"
          />
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-bold text-green-700 text-[15px] tracking-tight dark:text-green-200 sm:text-base">
              Formify
            </h1>
          </div>
        </div>

        <div className="hidden min-w-0 shrink flex-1 justify-center px-2 md:flex">
          <div className="flex min-w-0 justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mdUp ?
              <Suspense
                fallback={
                  <div
                    className="h-10 min-w-[12rem] max-w-[min(100vw-8rem,24rem)] shrink-0 animate-pulse rounded-xl bg-slate-200/85 dark:bg-slate-700/80"
                    aria-hidden
                  />
                }
              >
                <WorkspaceControls
                  layoutMode={layoutMode}
                  setLayoutMode={setLayoutMode}
                  responsesFirst={responsesFirst}
                  setResponsesFirst={setResponsesFirst}
                  builderOpen={builderOpen}
                  setBuilderOpen={setBuilderOpen}
                />
              </Suspense>
            : null}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 flex-nowrap items-center justify-end gap-x-1 sm:gap-x-1.5">
          <WorkspaceMobileActions
            responsesFirst={responsesFirst}
            setResponsesFirst={setResponsesFirst}
            builderOpen={builderOpen}
            setBuilderOpen={setBuilderOpen}
          />
          <nav
            aria-label="Help and appearance"
            className="flex items-center gap-1 border-slate-200/90 pl-1 sm:gap-1.5 dark:border-slate-600 md:border-none md:pl-0 max-md:border-l"
          >
            <NavbarTipsDialog />
            <NavbarAppearanceMenu themePreference={themePreference} setThemePreference={setThemePreference} />
          </nav>
        </div>
      </div>
    </header>
  );
}
