import type { CollectionUi } from "../../../types/quizz";

export type CollectionFilter = "all" | "mine" | `user-${number}`;

export type PendingDelete = { kind: "collection"; data: CollectionUi } | null;
