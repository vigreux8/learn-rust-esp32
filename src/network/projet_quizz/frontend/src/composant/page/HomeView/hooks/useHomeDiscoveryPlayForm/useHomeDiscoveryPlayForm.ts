import { route } from "preact-router";
import {
  buildPlayOrdersFromPicker,
  buildPlaySessionQuery,
  playOrdersRequireUserId,
  type PlayQtype,
} from "../../../../../lib/playOrder";
import { useGraphSessionSyncedPlayOptions } from "../../../../../lib/useGraphSessionSyncedPlayOptions";
import type { PlayModeSettings } from "../../../../ui/atomes/PlayModePicker/PlayModePicker.types";
import type { UseHomeDiscoveryPlayFormProps } from "./useHomeDiscoveryPlayForm.types";

/**
 * Formulaire « lancer une session » depuis l’accueil : réglages de mode de jeu, construction des ordres de tirage
 * et navigation vers la route quiz avec la query attendue.
 */
export function useHomeDiscoveryPlayForm({ identity }: UseHomeDiscoveryPlayFormProps) {
  const { playMode, setPlayMode, playQtype, setPlayQtype, playInfinite, setPlayInfinite } =
    useGraphSessionSyncedPlayOptions({ syncPanelExpanded: false });

  const goPlay = () => {
    const orders = buildPlayOrdersFromPicker(playMode);
    const q = buildPlaySessionQuery({
      orders,
      qtype: playQtype,
      infinite: playInfinite,
      userId: playOrdersRequireUserId(orders) ? identity.userId : undefined,
    });
    route(`/play/random${q}`);
  };

  return {
    form: {
      playMode,
      playQtype,
      playInfinite,
      onPatchPlayMode: (patch: Partial<PlayModeSettings>) => setPlayMode((prev) => ({ ...prev, ...patch })),
      onPlayQtypeChange: (value: PlayQtype) => setPlayQtype(value),
      onPlayInfiniteChange: (value: boolean) => setPlayInfinite(value),
      goPlay,
    },
  };
}
