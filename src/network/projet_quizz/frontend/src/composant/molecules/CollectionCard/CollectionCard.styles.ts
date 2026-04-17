/**
 * Centralise les classes Tailwind principales pour `CollectionCard`.
 * Les chaînes très contextuelles restent localement dans le JSX pour préserver
 * la lisibilité des blocs conditionnels.
 */
export const COLLECTION_CARD_STYLES = {
  root: "group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-flow/15",
  headerLayout: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
} as const;
