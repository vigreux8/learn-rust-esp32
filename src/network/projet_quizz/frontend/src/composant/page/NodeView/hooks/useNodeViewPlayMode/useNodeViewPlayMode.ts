import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { route } from "preact-router";

import {
  buildPlayOrdersFromPicker,
  buildPlaySessionQuery,
  playOrdersRequireUserId,
  type PlayQtype,
} from "../../../../../lib/playOrder";
import {
  defaultPlayModeSettings,
  readStoredNodeViewGraph,
  writeStoredNodeViewGraphMergePlayUi,
  type NodeViewGraphPlayUiSnapshot,
} from "../../../../../lib/nodeViewGraphSession";
import { useClosePanelOnDocumentClickOutside } from "../../../../../lib/useClosePanelOnDocumentClickOutside";
import type { PlayModeSettings } from "../../../../ui/atomes/PlayModePicker/PlayModePicker.types";
import type { UseNodeViewPlayModeOptions, UseNodeViewPlayModeResult } from "./useNodeViewPlayMode.types";

function readPlayBootstrap(): NodeViewGraphPlayUiSnapshot {
  const g = readStoredNodeViewGraph();
  if (g?.playUi != null) return g.playUi;
  return {
    playMode: defaultPlayModeSettings(),
    playQtype: "melanger",
    playInfinite: false,
    panelExpanded: false,
  };
}

/**
 * État du mode de jeu sur `/node` et navigation vers une session `/play/:id` alignée sur `CollectionCard`.
 */
export function useNodeViewPlayMode(opts: UseNodeViewPlayModeOptions): UseNodeViewPlayModeResult {
  const { userId, getGraphPlayIncludedCollectionIds } = opts;
  const bootRef = useRef<NodeViewGraphPlayUiSnapshot | null>(null);
  if (bootRef.current === null) {
    bootRef.current = readPlayBootstrap();
  }
  const boot = bootRef.current;
  const [panelExpanded, setPanelExpanded] = useState(boot.panelExpanded);
  const [playMode, setPlayMode] = useState<PlayModeSettings>(boot.playMode);
  const [playQtype, setPlayQtype] = useState<PlayQtype>(boot.playQtype);
  const [playInfinite, setPlayInfinite] = useState(boot.playInfinite);

  useEffect(() => {
    const pack = (): void => {
      try {
        writeStoredNodeViewGraphMergePlayUi({
          playMode,
          playQtype,
          playInfinite,
          panelExpanded,
        });
      } catch {
        /* sessionStorage indisponible ou quota */
      }
    };
    const t = window.setTimeout(pack, 120);
    const onVisibility = (): void => {
      if (document.visibilityState === "hidden") pack();
    };
    window.addEventListener("pagehide", pack);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pagehide", pack);
      document.removeEventListener("visibilitychange", onVisibility);
      pack();
    };
  }, [panelExpanded, playInfinite, playMode, playQtype]);

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
