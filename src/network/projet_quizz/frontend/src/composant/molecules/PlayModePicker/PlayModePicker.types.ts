import type { PlaySortBase } from "../../../lib/playOrder";

export type PlayModePickerProps = {
  idPrefix: string;
  neverAnswered: boolean;
  onNeverAnswered: (v: boolean) => void;
  sortBase: PlaySortBase;
  onSortBase: (v: PlaySortBase) => void;
  errorPriority: boolean;
  onErrorPriority: (v: boolean) => void;
  shuffleExtra: boolean;
  onShuffleExtra: (v: boolean) => void;
  labelAlignClass?: string;
};
