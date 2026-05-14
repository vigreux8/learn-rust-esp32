import type { RefObject } from "preact";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { useClosePanelOnDocumentClickOutside } from "../../../../../../lib/useClosePanelOnDocumentClickOutside";

import type { InfluenceurRolePick } from "./CreatorPanel.metier";
import type { CreatorPanelProps } from "./CreatorPanel.types";

/** Position du menu rôle en `fixed` : ancré sous le bouton (évite le clip `overflow-y` du panneau). */
export type RoleMenuListStyle = Record<string, string>;

export type CreatorPanelViewModel = {
  rootRef: RefObject<HTMLDivElement | null>;
  /** Portail `document.body` : `position:fixed` aligné sur le viewport réel (pas le sous-repère transform XYFlow). */
  menuPortalRef: RefObject<HTMLUListElement | null>;
  data: CreatorPanelProps["data"];
  settings: CreatorPanelProps["settings"];
  status: CreatorPanelProps["status"];
  menus: {
    openCreatorId: string | null;
    menuListStyle: RoleMenuListStyle | null;
    toggleRowMenu: (creatorId: string, anchor: HTMLElement | null) => void;
    pickRole: (creatorId: string, pick: InfluenceurRolePick) => void;
    removeCreator: (creatorId: string) => void;
  };
};

const MENU_VIEWPORT_MARGIN_PX = 8;

/** Menu juste sous le bouton rôle, même largeur mini, bord gauche aligné sur le bouton (rester dans le viewport). */
function computeRoleMenuListStyle(anchor: HTMLElement): RoleMenuListStyle {
  const r = anchor.getBoundingClientRect();
  const widthPx = Math.max(200, Math.ceil(r.width));
  let leftPx = Math.floor(r.left);
  leftPx = Math.max(
    MENU_VIEWPORT_MARGIN_PX,
    Math.min(leftPx, window.innerWidth - widthPx - MENU_VIEWPORT_MARGIN_PX),
  );
  const topPx = Math.ceil(r.bottom + 6);
  return {
    position: "fixed",
    zIndex: "6000",
    top: `${topPx}px`,
    left: `${leftPx}px`,
    width: `${widthPx}px`,
  };
}

/**
 * Menu rôle : position `fixed` recalculée sous le bouton (lisible malgré `overflow-y-auto` du panneau).
 */
export function useCreatorPanel(props: CreatorPanelProps): CreatorPanelViewModel {
  const { data, settings, status, actions } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuPortalRef = useRef<HTMLUListElement | null>(null);
  const menuAnchorRef = useRef<HTMLElement | null>(null);
  const [openCreatorId, setOpenCreatorId] = useState<string | null>(null);
  const [menuListStyle, setMenuListStyle] = useState<RoleMenuListStyle | null>(null);

  const closeMenu = useCallback(() => {
    menuAnchorRef.current = null;
    setMenuListStyle(null);
    setOpenCreatorId(null);
  }, []);

  useClosePanelOnDocumentClickOutside({
    open: openCreatorId != null,
    containerRef: rootRef,
    ignoreRefs: [menuPortalRef],
    onClose: closeMenu,
  });

  useLayoutEffect(() => {
    if (openCreatorId == null) {
      setMenuListStyle(null);
      return;
    }
    const el = menuAnchorRef.current;
    if (el == null) {
      setMenuListStyle(null);
      return;
    }
    setMenuListStyle(computeRoleMenuListStyle(el));
  }, [openCreatorId]);

  useEffect(() => {
    if (openCreatorId == null) return;
    const sync = () => {
      const el = menuAnchorRef.current;
      if (el != null) setMenuListStyle(computeRoleMenuListStyle(el));
    };
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [openCreatorId]);

  const toggleRowMenu = useCallback(
    (creatorId: string, anchor: HTMLElement | null) => {
      if (!settings.roleChangeEnabled) return;
      setOpenCreatorId((prev) => {
        if (prev === creatorId) {
          menuAnchorRef.current = null;
          return null;
        }
        menuAnchorRef.current = anchor;
        return creatorId;
      });
    },
    [settings.roleChangeEnabled],
  );

  const pickRole = useCallback(
    (creatorId: string, pick: InfluenceurRolePick) => {
      const pid = Number(creatorId);
      if (!Number.isFinite(pid)) return;
      actions.onRoleChange(pid, pick);
      menuAnchorRef.current = null;
      setMenuListStyle(null);
      setOpenCreatorId(null);
    },
    [actions],
  );

  const removeCreator = useCallback(
    (creatorId: string) => {
      const pid = Number(creatorId);
      if (!Number.isFinite(pid)) return;
      menuAnchorRef.current = null;
      setMenuListStyle(null);
      setOpenCreatorId(null);
      actions.onRemoveCreator(pid);
    },
    [actions],
  );

  return {
    rootRef,
    menuPortalRef,
    data,
    settings,
    status,
    menus: { openCreatorId, menuListStyle, toggleRowMenu, pickRole, removeCreator },
  };
}
