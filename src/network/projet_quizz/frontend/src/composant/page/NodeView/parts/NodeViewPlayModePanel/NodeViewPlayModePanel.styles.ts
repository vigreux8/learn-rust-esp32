export const NODE_VIEW_PLAY_MODE_PANEL_STYLES = {
  anchor:
    "pointer-events-none absolute inset-y-0 right-0 z-[48] flex w-0 max-w-none flex-col items-end justify-center pr-2 sm:pr-3",
  inner: "pointer-events-auto nodrag nowheel flex max-h-[min(88vh,40rem)] items-stretch gap-0",
  toggleCollapsed:
    "btn btn-primary btn-sm h-auto min-h-[7rem] shrink-0 rounded-l-2xl rounded-r-md px-1.5 py-3 shadow-lg writing-vertical",
  panel:
    "flex w-[min(100vw-3rem,22rem)] flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl",
  panelHeader: "flex shrink-0 items-center justify-between border-b border-base-300 bg-base-200/50 px-3 py-2",
  panelTitle: "text-xs font-bold uppercase tracking-wider text-base-content/70",
  panelBody: "min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3",
  pickerShell: "rounded-xl border border-base-content/10 bg-base-100/60 p-2",
  qtypeBlock: "mt-3 flex flex-col gap-1.5",
  qtypeLabel: "text-xs font-medium text-base-content/55",
  qtypeSelect:
    "select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 text-sm",
  infiniteLabel: "mt-2 flex cursor-pointer items-center gap-2 text-xs text-base-content/70",
} as const;
