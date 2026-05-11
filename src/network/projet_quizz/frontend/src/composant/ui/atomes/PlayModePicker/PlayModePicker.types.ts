import type { ChildCollectionsMix, PlaySortBase } from "../../../../lib/playOrder";

export type PlayModeSettings = {
  neverAnswered: boolean;
  wrongAnswered: boolean;
  sortBase: PlaySortBase;
  errorPriority: boolean;
  shuffleExtra: boolean;
  /** Inclure les suites logiques (réflexion) dans la session collection. */
  includeReflexion: boolean;
  /** Part cible des blocs réflexion (0–100), ex. 25 ≈ une suite après trois questions hors chaîne. */
  reflexionSharePercent: number;
  /** Inclure les questions des collections enfants (`relation-collection`). */
  includeChildCollections: boolean;
  /** Blocs séparés vs mélange global — voir `architecture.md` (mode de jeu). */
  childCollectionsMix: ChildCollectionsMix;
  /** Part du paquet tirée par famille (0–100). 100 = tout. */
  familyQuotaPercent: number;
  /**
   * Plafond de questions par famille (0 = désactivé).
   * Ex. 15 avec % à 100 ⇒ jusqu’à 15 questions par bloc puis mélange global des ids sélectionnés.
   */
  familyQuotaMax: number;
  /** Questions des fiches perso liées à la carte (`persoFiches=1`). */
  includePersonnaliteFiches: boolean;
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
  /** Masquer suites réflexion (ex. mélange global `/play/random`). */
  showReflexionOptions?: boolean;
};

