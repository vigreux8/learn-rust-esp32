import type { CollectionUi, QuizzModuleRow } from "../../../types/quizz";

export type CollectionFilter = "all" | "mine" | `user-${number}`;

export type PendingDelete =
  | null
  | { kind: "collection"; data: CollectionUi }
  | { kind: "module"; data: QuizzModuleRow };
