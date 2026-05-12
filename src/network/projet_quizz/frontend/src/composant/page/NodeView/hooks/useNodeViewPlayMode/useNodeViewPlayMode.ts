import { useCallback, useMemo, useRef } from "preact/hooks";
import { route } from "preact-router";

import { useGraphSessionSyncedPlayOptions } from "../../../../../lib/useGraphSessionSyncedPlayOptions";
import {
  buildPlayOrdersFromPicker,
  buildPlaySessionQuery,
  playOrdersRequireUserId,
} from "../../../../../lib/playOrder";
import { useClosePanelOnDocumentClickOutside } from "../../../../../lib/useClosePanelOnDocumentClickOutside";
import type { PlayModeSettings } from "../../../../ui/atomes/PlayModePicker/PlayModePicker.types";
import type { UseNodeViewPlayModeOptions, UseNodeViewPlayModeResult } from "./useNodeViewPlayMode.types";

/**
 * État du mode de jeu sur `/node` et navigation vers une session `/play/:id` alignée sur `CollectionCard`.
 */
export function useNodeViewPlayMode(opts: UseNodeViewPlayModeOptions): UseNodeViewPlayModeResult {
  const { userId, getGraphPlayIncludedCollectionIds } = opts;
  const {
    playMode,
    setPlayMode,
    playQtype,
    setPlayQtype,
    playInfinite,
    setPlayInfinite,
    panelExpanded,
    setPanelExpanded,
  } = useGraphSessionSyncedPlayOptions({ syncPanelExpanded: true });

  const panelRootRef = useRef<HTMLDivElement>(null);
  const closePanel = useCallback(() => {
    setPanelExpanded(false);
  }, [setPanelExpanded]);

  useClosePanelOnDocumentClickOutside({
    open: panelExpanded,
    containerRef: panelRootRef,
    onClose: closePanel,
  });

  const togglePanel = useCallback(() => {
    setPanelExpanded((v) => !v);
  }, [setPanelExpanded]);

  const onPatchMode = useCallback((patch: Partial<PlayModeSettings>) => {
    setPlayMode((prev) => ({ ...prev, ...patch }));
  }, [setPlayMode]);

  const navigateToPlayForCollection = useCallback(
    (collectionId: number) => {
      const graphIds = getGraphPlayIncludedCollectionIds();
      if (graphIds.length === 0) {
        window.alert(
          "Aucune collection du graphe n’est cochée pour le jeu. Coche au moins une carte (case à gauche du titre).",
        );
        return;
      }
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
          graphIncludeIds: graphIds,
        })}`,
      );
    },
    [getGraphPlayIncludedCollectionIds, playInfinite, playMode, playQtype, userId],
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
      getGraphPlayIncludedCollectionIds,
      onPatchMode,
      panelExpanded,
      playInfinite,
      playMode,
      playQtype,
      togglePanel,
    ],
  );
}
