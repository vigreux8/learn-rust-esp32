import type { PlaySortBase } from "../../../lib/playOrder";

export type PlayModeSettings = {
  neverAnswered: boolean;
  sortBase: PlaySortBase;
  errorPriority: boolean;
  shuffleExtra: boolean;
};

export const PLAY_MODE_SORT_OPTIONS = [
  ["none", "Par défaut (ordre collection / id)"],
  ["linear", "Linéaire (ordre stable)"],
  ["recent", "Ajout récent d’abord"],
  ["ancien", "Plus anciennes d’abord"],
] as const satisfies ReadonlyArray<readonly [PlaySortBase, string]>;


