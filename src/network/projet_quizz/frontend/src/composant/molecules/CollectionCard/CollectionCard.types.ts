import type { PlayQtype } from "../../../lib/playOrder";
import type { CollectionUi, PersonalitePickerRowUi, QuizzModuleRow } from "../../../types/quizz";
import type { PlayModeSettings } from "../../atomes/PlayModePicker/PlayModePicker.types";

export type LinkedModule = { id: number };

/** Case à cocher « vue sous-arbre » (cartes ayant au moins une sous-collection). */
export type CollectionCardHierarchyToggle = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

export type CollectionCardProps = {
  collection: CollectionUi;
  myUserId: number;
  allModules: QuizzModuleRow[];
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
  onAssign: (collectionId: number, moduleId: number) => void | Promise<void>;
  onUnassign: (collectionId: number, moduleId: number) => void | Promise<void>;
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

