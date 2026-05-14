import { ChevronDown, CircleMinus, CirclePlus } from "lucide-preact";

import { cn } from "../../../../../../lib/cn";

import { CREATOR_PANEL_STYLES } from "./CreatorPanel.styles";
import { useCreatorPanel } from "./CreatorPanel.hook";
import type { CreatorPanelProps } from "./CreatorPanel.types";
import { INFLUENCEUR_ROLE_MENU_OPTIONS, type InfluenceurRolePick } from "./CreatorPanel.metier";

function roleLabel(importanceType: string | null | undefined): string {
  const key = (importanceType ?? "") as InfluenceurRolePick;
  const opt = INFLUENCEUR_ROLE_MENU_OPTIONS.find((o) => o.value === key);
  return opt?.label ?? "—";
}

/**
 * Panneau influenceurs : liste compacte + menu rôle en `fixed` (lisible hors du panneau `h-40`).
 */
export function CreatorPanel(props: CreatorPanelProps) {
  const vm = useCreatorPanel(props);
  const { data, settings, status, menus } = vm;
  const { openCreatorId, menuListStyle, toggleRowMenu, pickRole, removeCreator } = menus;
  const saving = status.savingPersonaliteId != null;

  return (
    <div ref={vm.rootRef as never} className={CREATOR_PANEL_STYLES.root}>
      <div className={CREATOR_PANEL_STYLES.body}>
        <p className={CREATOR_PANEL_STYLES.legend}>Influenceurs</p>
        <ul className="m-0 list-none p-0">
          {data.creators.map((c) => {
            const isOpen = openCreatorId === c.id;
            return (
              <li key={c.id} className={CREATOR_PANEL_STYLES.row}>
                <div className={CREATOR_PANEL_STYLES.rowInner}>
                  <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                  <span className="shrink-0 text-xs text-base-content/50">{roleLabel(c.importanceType)}</span>
                  <div className={CREATOR_PANEL_STYLES.roleMenuRoot}>
                    <button
                      type="button"
                      className={CREATOR_PANEL_STYLES.roleMenuButton}
                      disabled={!settings.roleChangeEnabled || saving}
                      aria-expanded={isOpen}
                      aria-haspopup="listbox"
                      aria-label="Changer le rôle"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowMenu(c.id, e.currentTarget);
                      }}
                    >
                      <ChevronDown className={CREATOR_PANEL_STYLES.chevron} />
                    </button>
                  </div>
                </div>
                <div className={CREATOR_PANEL_STYLES.rowActions}>
                  <button
                    type="button"
                    className={CREATOR_PANEL_STYLES.removeButton}
                    disabled={!settings.roleChangeEnabled || saving}
                    aria-label="Retirer l'influenceur"
                    title="Retirer"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCreator(c.id);
                    }}
                  >
                    <CircleMinus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className={CREATOR_PANEL_STYLES.footer}>Glissez une personnalité sur le nœud pour l’ajouter.</p>
      </div>

      {openCreatorId != null && menuListStyle != null ? (
        <ul
          className={cn(CREATOR_PANEL_STYLES.roleMenuList, "m-0 list-none p-0")}
          style={menuListStyle as never}
          role="listbox"
          aria-label="Rôles"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {data.creators
            .filter((c) => c.id === openCreatorId)
            .map((c) => (
              <li key={`menu-${c.id}`} className="contents">
                {INFLUENCEUR_ROLE_MENU_OPTIONS.map((opt) => {
                  const current = (c.importanceType ?? "") as InfluenceurRolePick;
                  const active = opt.value === current;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        CREATOR_PANEL_STYLES.roleMenuItem,
                        active ? CREATOR_PANEL_STYLES.roleMenuItemActive : undefined,
                      )}
                      disabled={saving}
                      onClick={(e) => {
                        e.stopPropagation();
                        pickRole(c.id, opt.value);
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CreatorPanelAddHint() {
  return (
    <div className="flex items-center justify-center py-6 text-center text-xs text-base-content/45">
      <CirclePlus className="mr-1.5 h-4 w-4 shrink-0 text-flow/60" aria-hidden />
      Glissez une personnalité sur le nœud pour l’ajouter.
    </div>
  );
}
