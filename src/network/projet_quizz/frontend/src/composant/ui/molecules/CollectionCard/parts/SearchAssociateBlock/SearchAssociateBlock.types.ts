import type { ComponentChildren } from "preact";

export type SearchAssociateBlockProps<T> = {
  settings: {
    resetKey: number;
    title: string;
    placeholder: string;
    inputId: string;
    associateLabel: string;
    maxSuggestions?: number;
  };
  data: { candidates: T[] };
  meta: {
    getId: (item: T) => number;
    getSuggestionLabel: (item: T) => string;
    matchesQuery: (item: T, query: string) => boolean;
  };
  status: { busy: boolean; interactionLocked: boolean };
  actions: { onAssociate: (id: number) => void | Promise<void> };
  slots?: { betweenSelectionAndButton?: ComponentChildren };
};
