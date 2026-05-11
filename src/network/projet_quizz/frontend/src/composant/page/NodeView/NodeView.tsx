import { AppFooter } from "../../ui/atomes/AppFooter/AppFooter";
import { AppHeader } from "../../ui/atomes/AppHeader/AppHeader";
import { PageMain } from "../../ui/atomes/PageMain/PageMain";
import { NODE_VIEW_STYLES } from "./NodeView.styles";
import type { NodeViewProps } from "./NodeView.types";

export function NodeView(_props: NodeViewProps = {}) {
  return (
    <div class={NODE_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain>
        <div class={NODE_VIEW_STYLES.main}>
          <h1 class="text-2xl font-semibold text-base-content">Vue graphe</h1>
          <p class="max-w-prose text-base text-base-content/70">
            Placeholder : brancher ici le flux XYFlow (`composant/node/config`, `costumeNode`, etc.) quand le registry sera
            prêt.
          </p>
        </div>
      </PageMain>
      <AppFooter />
    </div>
  );
}
