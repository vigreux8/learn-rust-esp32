import { useCallback, useMemo, useRef, useState } from "preact/hooks";
import { route } from "preact-router";

import {
  buildPlayOrdersFromPicker,
  buildPlaySessionQuery,
  playOrdersRequireUserId,
  type PlayQtype,
} from "../../../../../lib/playOrder";
import { useClosePanelOnDocumentClickOutside } from "../../../../../lib/useClosePanelOnDocumentClickOutside";
import type { PlayModeSettings } from "../../../../ui/atomes/PlayModePicker/PlayModePicker.types";
import type { UseNodeViewPlayModeOptions, UseNodeViewPlayModeResult } from "./useNodeViewPlayMode.types";

const defaultPlayMode = (): PlayModeSettings => ({
  neverAnswered: false,
  wrongAnswered: false,
  sortBase: "none",
  errorPriority: false,
  shuffleExtra: false,
  includeReflexion: false,
  reflexionSharePercent: 25,
  includeChildCollections: false,
  childCollectionsMix: "famille",
  familyQuotaPercent: 100,
  familyQuotaMax: 0,
  includePersonnaliteFiches: false,
});

/**
 * État du mode de jeu sur `/node` et navigation vers une session `/play/:id` alignée sur `CollectionCard`.
 */
export function useNodeViewPlayMode(opts: UseNodeViewPlayModeOptions): UseNodeViewPlayModeResult {
  const { userId } = opts;
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [playMode, setPlayMode] = useState<PlayModeSettings>(defaultPlayMode);
  const [playQtype, setPlayQtype] = useState<PlayQtype>("melanger");
  const [playInfinite, setPlayInfinite] = useState(false);

  const panelRootRef = useRef<HTMLDivElement>(null);
  const closePanel = useCallback(() => {
    setPanelExpanded(false);
  }, []);

  useClosePanelOnDocumentClickOutside({
    open: panelExpanded,
    containerRef: panelRootRef,
    onClose: closePanel,
  });

  const togglePanel = useCallback(() => {
    setPanelExpanded((v) => !v);
  }, []);

  const onPatchMode = useCallback((patch: Partial<PlayModeSettings>) => {
    setPlayMode((prev) => ({ ...prev, ...patch }));
  }, []);

  const navigateToPlayForCollection = useCallback(
    (collectionId: number) => {
      const orders = buildPlayOrdersFromPicker(playMode);
      route(
        `/play/${collectionId}${buildPlaySessionQuery({
          orders,
          qtype: playQtype,
          infinite: playInfinite,
          userId: playOrdersRequireUserId(orders) ? userId ?? undefined : undefined,
          includeReflexion: playMode.includeReflexion === true ? true : undefined,
          reflexionSharePercent:
            playMode.includeReflexion && playMode.reflexionSharePercent !== 25
              ? playMode.reflexionSharePercent
              : undefined,
          includeChildCollections: playMode.includeChildCollections === true ? true : undefined,
          childCollectionsMix:
            playMode.includeChildCollections && playMode.childCollectionsMix !== "melange"
              ? playMode.childCollectionsMix
              : undefined,
          familyQuotaPercent:
            playMode.includeChildCollections && playMode.familyQuotaPercent !== 100
              ? playMode.familyQuotaPercent
              : undefined,
          familyQuotaMax:
            playMode.includeChildCollections && playMode.familyQuotaMax > 0
              ? playMode.familyQuotaMax
              : undefined,
          includePersonnaliteFiches: playMode.includePersonnaliteFiches === true ? true : undefined,
          fromNode: true,
        })}`,
      );
    },
    [playInfinite, playMode, playQtype, userId],
  );

  return useMemo(
    () => ({
      panel: { expanded: panelExpanded, toggle: togglePanel, containerRef: panelRootRef },
      play: {
        mode: playMode,
        onPatchMode,
        qtype: playQtype,
        onQtypeChange: setPlayQtype,
        infinite: playInfinite,
        onInfiniteChange: setPlayInfinite,
        navigateToPlayForCollection,
      },
    }),
    [
      navigateToPlayForCollection,
      onPatchMode,
      panelExpanded,
      playInfinite,
      playMode,
      playQtype,
      togglePanel,
    ],
  );
}
