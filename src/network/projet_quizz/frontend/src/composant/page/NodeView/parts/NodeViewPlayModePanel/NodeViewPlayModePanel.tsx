import type { Ref } from "preact";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-preact";
import { PlayModePicker } from "../../../../ui/atomes/PlayModePicker/PlayModePicker";
import { NODE_VIEW_PLAY_MODE_PANEL_STYLES } from "./NodeViewPlayModePanel.styles";
import type { NodeViewPlayModePanelProps } from "./NodeViewPlayModePanel.types";

/**
 * Panneau repliable à droite du canvas `/node` : mêmes options que la page Collections pour lancer une partie.
 */
export function NodeViewPlayModePanel(props: NodeViewPlayModePanelProps) {
  const { panel, play } = props;
  const { expanded, toggle, containerRef } = panel;

  return (
    <div class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.anchor}>
      <div ref={containerRef as Ref<HTMLDivElement>} class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.inner}>
        {expanded ? (
          <aside id="node-view-play-mode-panel" class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.panel}>
            <header class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.panelHeader}>
              <h2 class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.panelTitle}>Mode de jeu</h2>
              <button
                type="button"
                class="btn btn-circle btn-ghost btn-xs"
                aria-label="Replier le panneau mode de jeu"
                onClick={toggle}
              >
                <ChevronRight class="h-4 w-4" aria-hidden />
              </button>
            </header>
            <div class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.panelBody}>
              <p class="mb-2 text-[11px] leading-snug text-base-content/55">
                Les boutons lecture des nœuds collection utilisent ces réglages pour ouvrir{" "}
                <span class="font-mono text-[10px]">/play/:id</span>. Sur le graphe, coche à gauche de
                chaque carte les collections dont tu veux tirer des questions (décochée = exclue du
                paquet, y compris avec « collections enfant »).
              </p>
              <div class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.pickerShell}>
                <PlayModePicker
                  idPrefix="node-view-play"
                  settings={play.mode}
                  onChange={play.onPatchMode}
                  labelAlignClass="text-start"
                />
              </div>
              <div class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.qtypeBlock}>
                <label class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.qtypeLabel} for="node-view-play-qtype">
                  Type de questions
                </label>
                <select
                  id="node-view-play-qtype"
                  class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.qtypeSelect}
                  value={play.qtype}
                  onChange={(e) => {
                    const v = (e.target as HTMLSelectElement).value;
                    if (v === "histoire" || v === "pratique" || v === "connaissance" || v === "melanger") {
                      play.onQtypeChange(v);
                    }
                  }}
                >
                  <option value="melanger">Mélanger</option>
                  <option value="histoire">Histoire</option>
                  <option value="pratique">Pratique</option>
                  <option value="connaissance">Connaissance</option>
                </select>
              </div>
              <label class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.infiniteLabel}>
                <input
                  type="checkbox"
                  class="checkbox checkbox-xs checkbox-primary"
                  checked={play.infinite}
                  onChange={(e) => play.onInfiniteChange((e.target as HTMLInputElement).checked)}
                />
                Session infinie (15)
              </label>
            </div>
          </aside>
        ) : null}
        <button
          type="button"
          class={NODE_VIEW_PLAY_MODE_PANEL_STYLES.toggleCollapsed}
          aria-expanded={expanded}
          aria-controls="node-view-play-mode-panel"
          onClick={toggle}
        >
          <span class="flex flex-col items-center gap-1">
            <Gamepad2 class="h-4 w-4 shrink-0" aria-hidden />
            <span class="text-[10px] font-semibold uppercase tracking-wide">Mode jeu</span>
            {expanded ? <ChevronLeft class="h-3 w-3" aria-hidden /> : <ChevronRight class="h-3 w-3" aria-hidden />}
          </span>
        </button>
      </div>
    </div>
  );
}
