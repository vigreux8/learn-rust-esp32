export const APP_HEADER_STYLES = {
  header: "sticky top-0 z-40 border-b border-base-content/5 bg-base-100/80 backdrop-blur-lg transition-shadow duration-300",
  container: "mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
  brandButton: "flex items-center gap-2.5 rounded-full px-1 py-1 text-left transition duration-300 ease-out hover:opacity-90 active:scale-[0.98]",
  brandIcon: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-flow to-learn text-white shadow-lg shadow-flow/20",
  nav: "flex flex-wrap items-center justify-center gap-1.5 sm:justify-end",
  navLinkBase: "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-out active:scale-[0.97]",
  navLinkActive: "bg-flow text-white shadow-xl shadow-flow/25 hover:scale-[1.03] hover:brightness-110 hover:shadow-xl hover:shadow-flow/35",
  navLinkIdle: "text-base-content/70 hover:bg-learn/14 hover:text-learn hover:scale-[1.02]",
} as const;
