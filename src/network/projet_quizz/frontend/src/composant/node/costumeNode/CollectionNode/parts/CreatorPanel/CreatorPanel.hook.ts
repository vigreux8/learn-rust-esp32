import type { RefObject } from "preact";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { useClosePanelOnDocumentClickOutside } from "../../../../../../lib/useClosePanelOnDocumentClickOutside";

import type { InfluenceurRolePick } from "./CreatorPanel.metier";
import type { CreatorPanelProps } from "./CreatorPanel.types";

/** Position du menu rôle en viewport (`fixed`) pour éviter le clip du panneau `h-40`. */
export type RoleMenuListStyle = Record<string, string>;

export type CreatorPanelViewModel = {
  rootRef: RefObject<HTMLDivElement | null>;
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

const MENU_MIN_SPACE_PX = 220;

function computeRoleMenuListStyle(anchor: HTMLElement): RoleMenuListStyle {
  const r = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - r.bottom;
  const widthPx = Math.max(200, Math.ceil(r.width));
  let leftPx = Math.ceil(r.right - widthPx);
  leftPx = Math.max(8, Math.min(leftPx, window.innerWidth - widthPx - 8));

  if (spaceBelow < MENU_MIN_SPACE_PX) {
    const bottomPx = Math.ceil(window.innerHeight - r.top + 6);
    return {
      position: "fixed",
      zIndex: "6000",
      bottom: `${bottomPx}px`,
      left: `${leftPx}px`,
      width: `${widthPx}px`,
    };
  }
  return {
    position: "fixed",
    zIndex: "6000",
    top: `${Math.ceil(r.bottom + 6)}px`,
    left: `${leftPx}px`,
    width: `${widthPx}px`,
  };
}

/**
 * Menu rôle : position `fixed` + recalcul au layout pour lisibilité hors du panneau étroit.
 */
export function useCreatorPanel(props: CreatorPanelProps): CreatorPanelViewModel {
  const { data, settings, status, actions } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
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
    const onScrollOrResize = () => closeMenu();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [openCreatorId, closeMenu]);

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
    data,
    settings,
    status,
    menus: { openCreatorId, menuListStyle, toggleRowMenu, pickRole, removeCreator },
  };
}
