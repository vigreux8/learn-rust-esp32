import type { PlayQtype } from "../../../lib/playOrder";
import type { CollectionUi, PersonalitePickerRowUi } from "../../../types/quizz";
import type { PlayModeSettings } from "../../atomes/PlayModePicker/PlayModePicker.types";

export type CollectionTagRef = { id: number; nom: string };

/** Case à cocher « vue sous-arbre » (cartes ayant au moins une sous-collection). */
export type CollectionCardHierarchyToggle = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

export type CollectionCardProps = {
  collection: CollectionUi;
  myUserId: number;
  /** Collections pouvant servir d’étiquette (hors exclusions gérées dans la carte). */
  tagPickerPool: CollectionTagRef[];
  assignBusyCollectionId: number | null;
  deleteBusyCollectionId: number | null;
  interactionLocked?: boolean;
  playMode: PlayModeSettings;
  playQtype: PlayQtype;
  playInfinite: boolean;
  /** Profondeur dans l’arbre parent → enfants (couleur de contour). */
  treeDepth: number;
  /** Filtrer la page sur les seuls descendants de cette collection (si fourni). */
  hierarchyViewToggle?: CollectionCardHierarchyToggle;
  onAssignTag: (collectionId: number, tagCollectionId: number) => void | Promise<void>;
  onUnassignTag: (collectionId: number, tagCollectionId: number) => void | Promise<void>;
  onDeleteCollection?: (collection: CollectionUi) => void;
  /** Rattacher / détacher des personnalités (cartes dont tu es propriétaire). */
  personalitesPicker?: PersonalitePickerRowUi[];
  assignPersoBusyCollectionId?: number | null;
  onAssignPerso?: (
    collectionId: number,
    personaliteId: number,
    importanceType: "" | "pionnier" | "important" | "secondaire",
  ) => void | Promise<void>;
  onUnassignPerso?: (collectionId: number, personaliteId: number) => void | Promise<void>;
};
