import type { CollectionUi } from "../../../../types/quizz";

/** Paramètres potentiels externes (garder vide tant que la route ne fournit pas d’entrées dédiées). */
export type CollectionsViewProps = {
  routing: Record<string, never>;
};

export type CollectionFilter = "all" | "mine" | `user-${number}`;

export type PendingDelete = { kind: "collection"; data: CollectionUi } | null;
