import { Database, MessageSquare, Plus, UserRound } from "lucide-preact";
import { cn } from "../../../../../../lib/cn";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { SidebarRailProps } from "./SidebarRail.types";

/**
 * Barre verticale d’icônes pour ouvrir les panneaux Collections, Questions ou Personnalités.
 */
export function SidebarRail(props: SidebarRailProps) {
  const { data, actions } = props;
  const collectionsActive = data.activeTab === "collections";
  const questionsActive = data.activeTab === "questions";
  const personalitiesActive = data.activeTab === "personalities";
  const createActive = data.activeTab === "create";

  return (
    <nav class={FLOW_SIDEBAR_OVERLAY_STYLES.rail} aria-label="Outils du graphe">
      <button
        type="button"
        class={cn(
          FLOW_SIDEBAR_OVERLAY_STYLES.railButton,
          collectionsActive && FLOW_SIDEBAR_OVERLAY_STYLES.railButtonActiveCollections,
        )}
        aria-pressed={collectionsActive}
        aria-label="Filtrer les collections"
        onClick={() => actions.toggleTab("collections")}
      >
        <Database size={20} aria-hidden />
      </button>
      <button
        type="button"
        class={cn(
          FLOW_SIDEBAR_OVERLAY_STYLES.railButton,
          questionsActive && FLOW_SIDEBAR_OVERLAY_STYLES.railButtonActiveQuestions,
        )}
        aria-pressed={questionsActive}
        aria-label="Voir les questions par collection"
        onClick={() => actions.toggleTab("questions")}
      >
        <MessageSquare size={20} aria-hidden />
      </button>
      <button
        type="button"
        class={cn(
          FLOW_SIDEBAR_OVERLAY_STYLES.railButton,
          personalitiesActive && FLOW_SIDEBAR_OVERLAY_STYLES.railButtonActivePersonalities,
        )}
        aria-pressed={personalitiesActive}
        aria-label="Filtrer les personnalités"
        onClick={() => actions.toggleTab("personalities")}
      >
        <UserRound size={20} aria-hidden />
      </button>
      <button
        type="button"
        class={cn(
          FLOW_SIDEBAR_OVERLAY_STYLES.railButton,
          createActive && FLOW_SIDEBAR_OVERLAY_STYLES.railButtonActiveCreate,
        )}
        aria-pressed={createActive}
        aria-label="Créer un nœud collection ou personnalité"
        onClick={() => actions.toggleTab("create")}
      >
        <Plus size={20} aria-hidden />
      </button>
    </nav>
  );
}
