import type { CreatorItem } from "../../CollectionNode.types";

export type CreatorPanelProps = {
  creators: CreatorItem[];
  dropZone?: {
    onDragOver: (event: DragEvent) => void;
    onDrop: (event: DragEvent) => void;
  };
};
