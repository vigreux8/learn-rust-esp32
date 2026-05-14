import { ChevronDown, CircleMinus, CirclePlus } from "lucide-preact";
import { createPortal } from "preact/compat";

import { personaliteImportanceAccentHex } from "../../../../../../lib/collectionHierarchyVis";
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
 * Panneau influenceurs : menu rôle en portail `body` + `fixed` (XYFlow : `transform` sur le viewport casse `fixed` dans l’arbre).
 */
export function CreatorPanel(props: CreatorPanelProps) {
  const vm = useCreatorPanel(props);
  const { data, settings, status, menus } = vm;
  const { openCreatorId, menuListStyle, toggleRowMenu, pickRole, removeCreator } = menus;
  const saving = status.savingPersonaliteId != null;

  const roleMenuPortal =
    openCreatorId != null && menuListStyle != null
      ? createPortal(
          <ul
            ref={vm.menuPortalRef as never}
            className={cn(CREATOR_PANEL_STYLES.roleMenuList, "m-0 list-none p-0")}
            style={menuListStyle as never}
            role="listbox"
            aria-label="Rôles"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerDownCapture={(e) => e.stopPropagation()}
          >
            {data.creators
              .filter((c) => c.id === openCreatorId)
              .map((c) => (
                <li key={`menu-${c.id}`} className="contents">
                  {INFLUENCEUR_ROLE_MENU_OPTIONS.map((opt) => {
                    const current = (c.importanceType ?? "") as InfluenceurRolePick;
                    const active = opt.value === current;
                    const dotHex = personaliteImportanceAccentHex(
                      opt.value === "" ? null : opt.value,
                    );
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
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          pickRole(c.id, opt.value);
                        }}
                      >
                        <span
                          className="mr-2 inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: dotHex }}
                          aria-hidden
                        />
                        {opt.label}
                      </button>
                    );
                  })}
                </li>
              ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={vm.rootRef as never} className={CREATOR_PANEL_STYLES.root}>
      <div className={CREATOR_PANEL_STYLES.body}>
        <p className={CREATOR_PANEL_STYLES.legend}>Influenceurs</p>
        <ul className="m-0 list-none p-0">
          {data.creators.map((c) => {
            const isOpen = openCreatorId === c.id;
            const accent = personaliteImportanceAccentHex(c.importanceType);
            return (
              <li
                key={c.id}
                className={CREATOR_PANEL_STYLES.row}
                style={{ borderLeftColor: accent }}
              >
                <div className={CREATOR_PANEL_STYLES.rowInner}>
                  <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                  <button
                    type="button"
                    className={CREATOR_PANEL_STYLES.rolePickTrigger}
                    disabled={!settings.roleChangeEnabled || saving}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-label={`Rôle actuel : ${roleLabel(c.importanceType)}. Ouvrir le menu pour changer.`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowMenu(c.id, e.currentTarget);
                    }}
                  >
                    <span className={CREATOR_PANEL_STYLES.rolePickLabel} style={{ color: accent }}>
                      {roleLabel(c.importanceType)}
                    </span>
                    <ChevronDown className={CREATOR_PANEL_STYLES.chevron} aria-hidden />
                  </button>
                </div>
                <div className={CREATOR_PANEL_STYLES.rowActions}>
                  <button
                    type="button"
                    className={CREATOR_PANEL_STYLES.removeButton}
                    disabled={!settings.roleChangeEnabled || saving}
                    aria-label="Retirer l'influenceur"
                    title="Retirer"
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
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

      {roleMenuPortal}
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
