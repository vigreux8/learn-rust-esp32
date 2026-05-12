import { useEffect, useRef, useState } from "preact/hooks";

import type { PlayQtype } from "./playOrder";
import type { PlayModeSettings } from "../composant/ui/atomes/PlayModePicker/PlayModePicker.types";
import {
  readStoredNodeViewGraph,
  readStoredPlayUiSnapshot,
  writeStoredNodeViewGraphMergePlayUi,
  type NodeViewGraphPlayUiSnapshot,
} from "./nodeViewGraphSession";

export type UseGraphSessionSyncedPlayOptionsConfig = {
  /**
   * Si vrai, `panelExpanded` est piloté ici et écrit en session avec le reste.
   * Sinon, au flush on réutilise `playUi.panelExpanded` déjà stocké (ex. panneau `/node`).
   */
  syncPanelExpanded: boolean;
};

export type UseGraphSessionSyncedPlayOptionsResult = {
  playMode: PlayModeSettings;
  setPlayMode: (v: PlayModeSettings | ((prev: PlayModeSettings) => PlayModeSettings)) => void;
  playQtype: PlayQtype;
  setPlayQtype: (v: PlayQtype | ((prev: PlayQtype) => PlayQtype)) => void;
  playInfinite: boolean;
  setPlayInfinite: (v: boolean | ((prev: boolean) => boolean)) => void;
  panelExpanded: boolean;
  setPanelExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
};

/**
 * Options de session (mode, type de questions, infini, panneau) persistées avec le graphe `/node`.
 */
export function useGraphSessionSyncedPlayOptions(
  config: UseGraphSessionSyncedPlayOptionsConfig,
): UseGraphSessionSyncedPlayOptionsResult {
  const { syncPanelExpanded } = config;
  const bootRef = useRef<NodeViewGraphPlayUiSnapshot | null>(null);
  if (bootRef.current === null) {
    bootRef.current = readStoredPlayUiSnapshot();
  }
  const boot = bootRef.current;
  const [playMode, setPlayMode] = useState(boot.playMode);
  const [playQtype, setPlayQtype] = useState(boot.playQtype);
  const [playInfinite, setPlayInfinite] = useState(boot.playInfinite);
  const [panelExpanded, setPanelExpanded] = useState(boot.panelExpanded);

  useEffect(() => {
    const pack = (): void => {
      try {
        const prev = readStoredNodeViewGraph();
        writeStoredNodeViewGraphMergePlayUi({
          playMode,
          playQtype,
          playInfinite,
          panelExpanded: syncPanelExpanded ? panelExpanded : (prev?.playUi?.panelExpanded ?? false),
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
  }, [panelExpanded, playInfinite, playMode, playQtype, syncPanelExpanded]);

  return {
    playMode,
    setPlayMode,
    playQtype,
    setPlayQtype,
    playInfinite,
    setPlayInfinite,
    panelExpanded,
    setPanelExpanded,
  };
}
