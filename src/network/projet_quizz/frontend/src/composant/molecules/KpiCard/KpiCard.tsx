import { Card } from "../../atomes/Card";
import { cn } from "../../../lib/cn";
import { KPI_CARD_STYLES } from "./KpiCard.styles";
import type { KpiCardProps } from "./KpiCard.types";

export function KpiCard({ title, value, hint, icon, accent = "flow" }: KpiCardProps) {
  return (
    <Card padding="sm" class={KPI_CARD_STYLES.wrapper}>
      <div
        class={cn(
          KPI_CARD_STYLES.glow,
          accent === "flow" ? "bg-flow" : "bg-learn",
        )}
      />
      <div class={KPI_CARD_STYLES.content}>
        {icon ? <div class={accent === "flow" ? "text-flow" : "text-learn"}>{icon}</div> : null}
        <div class="min-w-0 flex-1 space-y-1">
          <p class="text-xs font-medium uppercase tracking-wide text-base-content/50">{title}</p>
          <p class={cn("text-2xl font-semibold tracking-tight", accent === "flow" ? "text-flow" : "text-learn")}>
            {value}
          </p>
          {hint ? <p class="text-xs text-base-content/55">{hint}</p> : null}
        </div>
      </div>
    </Card>
  );
}
