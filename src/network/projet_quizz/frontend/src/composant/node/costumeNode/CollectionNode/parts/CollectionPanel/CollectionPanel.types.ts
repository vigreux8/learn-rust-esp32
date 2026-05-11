import type { CollectionItem } from "../../CollectionNode.types";

export type CollectionPanelProps = {
  supercollections: CollectionItem[];
  dropZone?: {
    onDragOver: (event: DragEvent) => void;
    onDrop: (event: DragEvent) => void;
  };
};
