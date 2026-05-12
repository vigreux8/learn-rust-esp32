import type { RefObject } from "preact";
import type { PlayQtype } from "../../../../../lib/playOrder";
import type { PlayModeSettings } from "../../../../ui/atomes/PlayModePicker/PlayModePicker.types";

export type UseNodeViewPlayModeOptions = {
  userId: number | null;
};

export type UseNodeViewPlayModeResult = {
  panel: {
    expanded: boolean;
    toggle: () => void;
    /** Conteneur rail + panneau : clic en dehors replie (même logique que la sidebar gauche). */
    containerRef: RefObject<HTMLDivElement | null>;
  };
  play: {
    mode: PlayModeSettings;
    onPatchMode: (patch: Partial<PlayModeSettings>) => void;
    qtype: PlayQtype;
    onQtypeChange: (value: PlayQtype) => void;
    infinite: boolean;
    onInfiniteChange: (value: boolean) => void;
    navigateToPlayForCollection: (collectionId: number) => void;
  };
};
