import type { PlaySortBase } from "../../../lib/playOrder";

export const PLAY_MODE_SORT_OPTIONS: ReadonlyArray<readonly [PlaySortBase, string]> = [
  ["none", "Par défaut (ordre collection / id)"],
  ["linear", "Linéaire (ordre stable)"],
  ["recent", "Ajout récent d’abord"],
  ["ancien", "Plus anciennes d’abord"],
] as const;
