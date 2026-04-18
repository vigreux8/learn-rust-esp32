import { Wifi } from "lucide-preact";
import { APP_VERSION } from "../../../lib/config";
import { APP_FOOTER_STYLES } from "./AppFooter.styles";

export function AppFooter() {
  return (
    <footer class={APP_FOOTER_STYLES.footer}>
      <div class={APP_FOOTER_STYLES.container}>
        <span>FlowLearn v{APP_VERSION}</span>
        <span class={APP_FOOTER_STYLES.separator}>·</span>
        <span class={APP_FOOTER_STYLES.badge}>
          <Wifi class="h-3.5 w-3.5" aria-hidden />
          ESP32 (mock) — connecté
        </span>
      </div>
    </footer>
  );
}
