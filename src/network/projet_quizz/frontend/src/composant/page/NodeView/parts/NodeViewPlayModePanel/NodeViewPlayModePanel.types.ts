import type { RefObject } from "preact";
import type { PlayQtype } from "../../../../../lib/playOrder";
import type { PlayModeSettings } from "../../../../ui/atomes/PlayModePicker/PlayModePicker.types";

export type NodeViewPlayModePanelProps = {
  panel: {
    expanded: boolean;
    toggle: () => void;
    containerRef: RefObject<HTMLDivElement | null>;
  };
  play: {
    mode: PlayModeSettings;
    onPatchMode: (patch: Partial<PlayModeSettings>) => void;
    qtype: PlayQtype;
    onQtypeChange: (value: PlayQtype) => void;
    infinite: boolean;
    onInfiniteChange: (value: boolean) => void;
  };
};
