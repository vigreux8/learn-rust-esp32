import type { RefObject } from "preact";
import { useEffect } from "preact/hooks";

export type UseClosePanelOnDocumentClickOutsideOptions = {
  /** Quand `true`, un clic hors du conteneur appelle `onClose`. */
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  /**
   * Cibles considérées comme « intérieur » en plus de `containerRef` (ex. panneau voisin sur le canvas).
   */
  ignoreRefs?: ReadonlyArray<RefObject<HTMLElement | null>>;
  onClose: () => void;
};

/**
 * Fermeture au clic (bouton principal, relâchement) en dehors du conteneur, phase capture — aligné sur `FlowSidebarOverlay`.
 */
export function useClosePanelOnDocumentClickOutside(
  options: UseClosePanelOnDocumentClickOutsideOptions,
): void {
  const { open, containerRef, ignoreRefs, onClose } = options;
  useEffect(() => {
    if (!open) return;
    const onClickCapture = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const root = containerRef.current;
      if (root == null) return;
      const target = event.target as Node | null;
      if (target == null) return;
      if (root.contains(target)) return;
      if (ignoreRefs != null) {
        for (const ref of ignoreRefs) {
          const el = ref.current;
          if (el != null && el.contains(target)) return;
        }
      }
      onClose();
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [open, onClose, containerRef, ignoreRefs]);
}
