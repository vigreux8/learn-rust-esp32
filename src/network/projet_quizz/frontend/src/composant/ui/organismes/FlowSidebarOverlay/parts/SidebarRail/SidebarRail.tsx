import { ChevronsDownUp, Database, MessageSquare, Plus, Search, Settings, UserRound } from "lucide-preact";
import { cn } from "../../../../../../lib/cn";
import { FLOW_SIDEBAR_OVERLAY_STYLES } from "../../FlowSidebarOverlay.styles";
import type { SidebarRailProps } from "./SidebarRail.types";

/**
 * Barre verticale d’icônes pour ouvrir les panneaux Collections, Questions ou Personnalités,
 * plus un bouton sous la barre pour déplier / replier les panneaux des nœuds collection.
 */
export function SidebarRail(props: SidebarRailProps) {
  const { data, actions } = props;
  const collectionsActive = data.activeTab === "collections";
  const questionsActive = data.activeTab === "questions";
  const personalitiesActive = data.activeTab === "personalities";
  const createActive = data.activeTab === "create";
  const subtreeActive = data.activeTab === "collectionSubtree";
  const settingsActive = data.activeTab === "settings";
  const toolbar = data.graphCollectionPanelsToolbar;

  return (
    <div class="pointer-events-auto flex flex-col items-center gap-2">
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
            subtreeActive && FLOW_SIDEBAR_OVERLAY_STYLES.railButtonActiveCollectionSubtree,
          )}
          aria-pressed={subtreeActive}
          aria-label="Rechercher une collection et afficher sa branche sur le graphe"
          onClick={() => actions.toggleTab("collectionSubtree")}
        >
          <Search size={20} aria-hidden />
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
        <button
          type="button"
          class={cn(
            FLOW_SIDEBAR_OVERLAY_STYLES.railButton,
            settingsActive && FLOW_SIDEBAR_OVERLAY_STYLES.railButtonActiveSettings,
          )}
          aria-pressed={settingsActive}
          aria-label="Réglages du graphe"
          onClick={() => actions.toggleTab("settings")}
        >
          <Settings size={20} aria-hidden />
        </button>
      </nav>

      {toolbar != null ? (
        <button
          type="button"
          class="btn btn-square btn-ghost btn-sm shrink-0 border border-base-content/15 bg-base-100/95 shadow-sm backdrop-blur-sm"
          disabled={toolbar.collectionNodeCount === 0}
          title={
            toolbar.anySidePanelOpen
              ? "Replier les panneaux # et influenceurs sur toutes les collections du graphe"
              : "Déplier ces panneaux sur toutes les collections du graphe"
          }
          aria-pressed={toolbar.anySidePanelOpen}
          onClick={() => toolbar.onToggleAll()}
        >
          <ChevronsDownUp size={18} class="opacity-85" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
