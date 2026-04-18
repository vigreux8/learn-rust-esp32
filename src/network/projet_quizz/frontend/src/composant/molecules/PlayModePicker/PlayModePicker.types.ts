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

/**
 * Props du panneau de choix du mode de lecture (filtres, tri, options KPI, mélange).
 *
 * @property idPrefix - Préfixe pour les attributs `id` et `name` des champs, afin d’éviter les collisions lorsque plusieurs pickers coexistent.
 * @property settings - Objet d’état courant du mode de jeu (`PlayModeSettings`).
 * @property onChange - Callback appelée avec un **patch partiel** à fusionner dans l’état parent après chaque interaction utilisateur.
 * @property labelAlignClass - Classes Tailwind additionnelles pour l’alignement des libellés de section (ex. `text-center`, `sm:text-end`).
 */
export type PlayModePickerProps = {
  idPrefix: string;
  settings: PlayModeSettings;
  onChange: (newSettings: Partial<PlayModeSettings>) => void;
  labelAlignClass?: string;
};

