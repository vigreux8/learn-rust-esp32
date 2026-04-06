import type { ComponentChildren } from "preact";
import { Card } from "../atomes/Card";
import { cn } from "../../lib/cn";

export type KpiCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon?: ComponentChildren;
  accent?: "flow" | "learn";
};

export function KpiCard({ title, value, hint, icon, accent = "flow" }: KpiCardProps) {
  return (
    <Card padding="sm" class="relative overflow-hidden">
      <div
        class={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl",
          accent === "flow" ? "bg-flow" : "bg-learn",
        )}
      />
      <div class="relative flex items-start gap-3">
        {icon ? (
          <div class={accent === "flow" ? "text-flow" : "text-learn"}>{icon}</div>
        ) : null}
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
