import type { PlayQtype } from "../../../lib/playOrder";
import type { CollectionUi, QuizzModuleRow } from "../../../types/quizz";
import type { PlayModeSettings } from "../../atomes/PlayModePicker/PlayModePicker.types";

export type LinkedModule = { id: number };

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
  onAssign: (collectionId: number, moduleId: number) => void | Promise<void>;
  onUnassign: (collectionId: number, moduleId: number) => void | Promise<void>;
  onDeleteCollection?: (collection: CollectionUi) => void;
};

