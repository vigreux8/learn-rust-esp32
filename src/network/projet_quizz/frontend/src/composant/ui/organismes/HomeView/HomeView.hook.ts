import { useUserSession } from "../../../../lib/userSession";
import { parsePlayQtypeSelectValue } from "./HomeView.metier";
import type { HomeViewProps } from "./HomeView.types";
import { useHomeDiscoveryPlayForm } from "./hooks/useHomeDiscoveryPlayForm";

/**
 * Orchestrateur accueil : expose les choix de lancement de session (`useHomeDiscoveryPlayForm`) pour la vue.
 */
export function useHomeView(_props: HomeViewProps) {
  const { userId } = useUserSession();
  const discovery = useHomeDiscoveryPlayForm({ identity: { userId } });

  return {
    play: {
      playMode: discovery.form.playMode,
      playQtype: discovery.form.playQtype,
      playInfinite: discovery.form.playInfinite,
      onPatchPlayMode: discovery.form.onPatchPlayMode,
      onPickQtypeFromDomEvent: (e: Event) => {
        const parsed = parsePlayQtypeSelectValue((e.target as HTMLSelectElement).value);
        if (parsed != null) discovery.form.onPlayQtypeChange(parsed);
      },
      onPickInfiniteFromDomEvent: (e: Event) => discovery.form.onPlayInfiniteChange((e.target as HTMLInputElement).checked),
      goPlay: discovery.form.goPlay,
    },
  };
}
