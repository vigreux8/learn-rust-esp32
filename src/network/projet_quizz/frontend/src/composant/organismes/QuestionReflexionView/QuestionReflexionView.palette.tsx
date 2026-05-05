import { useDraggable } from "@dnd-kit/react";
import { COLLECTION_TREE_LEVEL_BORDER_HEX } from "../../../lib/collectionHierarchyVis";
import { REFLEXION_DRAG_PALETTE_TYPE } from "./QuestionReflexionView.metier";
import { QUESTION_REFLEXION_VIEW_STYLES } from "./QuestionReflexionView.styles";

function PaletteDot(props: {
  level: number | null;
  hex: string;
  disabled: boolean;
  title: string;
}) {
  const dragId = props.level === null ? "reflexion-palette-clear" : `reflexion-palette-${props.level}`;
  const { ref, isDragging } = useDraggable({
    id: dragId,
    disabled: props.disabled,
    data: { type: REFLEXION_DRAG_PALETTE_TYPE, level: props.level },
  });

  return (
    <span
      ref={ref}
      role="button"
      tabIndex={props.disabled ? -1 : 0}
      title={props.title}
      aria-label={props.title}
      aria-disabled={props.disabled ? true : undefined}
      class={
        props.disabled
          ? "pointer-events-none opacity-40"
          : "cursor-grab active:cursor-grabbing hover:scale-105"
      }
      style={{
        width: "1.125rem",
        height: "1.125rem",
        borderRadius: "9999px",
        backgroundColor: props.hex,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
        opacity: isDragging ? 0.35 : 1,
      }}
    />
  );
}

export type ReflexionPaletteStripProps = {
  disabled: boolean;
};

/** Pastilles couleur (palette arbre collections) — glisser sur une vignette ordonnée. */
export function ReflexionPaletteStrip(props: ReflexionPaletteStripProps) {
  return (
    <div class="mb-3 flex flex-col gap-2 rounded-xl border border-base-content/10 bg-base-200/35 px-3 py-2 sm:flex-row sm:items-center">
      <p class="text-xs leading-snug text-base-content/65">
        Couleurs (comme les cartes collection par niveau) : glisse un rond sur une vignette pour marquer un groupe
        logique (ex. énoncé / donnée / formule / application).
      </p>
      <div class="flex flex-shrink-0 flex-wrap items-center gap-2">
        <span class="text-[10px] font-medium uppercase tracking-wide text-base-content/45">Palette</span>
        <div class="flex flex-wrap items-center gap-1.5">
          {COLLECTION_TREE_LEVEL_BORDER_HEX.map((hex, level) => (
            <PaletteDot
              key={level}
              level={level}
              hex={hex}
              disabled={props.disabled}
              title={`Couleur ${level + 1} sur ${COLLECTION_TREE_LEVEL_BORDER_HEX.length}`}
            />
          ))}
          <PaletteDot
            level={null}
            hex="#cbd5e1"
            disabled={props.disabled}
            title="Effacer la couleur sur la vignette cible"
          />
        </div>
      </div>
    </div>
  );
}

export type ReflexionPaletteRailProps = {
  disabled: boolean;
};

/**
 * Pastilles empilées à droite : même drag que la strip, layout vertical pour rail fixe.
 * Texte court + défilement si la fenêtre est basse.
 */
export function ReflexionPaletteRail(props: ReflexionPaletteRailProps) {
  return (
    <div class={QUESTION_REFLEXION_VIEW_STYLES.paletteRailCard} role="group" aria-label="Palette de couleurs pour les vignettes">
      <p class="max-w-[7rem] text-center text-[10px] font-medium uppercase leading-tight tracking-wide text-base-content/50">
        Couleurs
      </p>
      <p class="sr-only">
        Glisse un rond sur une vignette de la colonne « Questions ordonnées » : même palette que les bords des cartes
        collection.
      </p>
      <div class="flex flex-col items-center gap-2">
        {COLLECTION_TREE_LEVEL_BORDER_HEX.map((hex, level) => (
          <PaletteDot
            key={level}
            level={level}
            hex={hex}
            disabled={props.disabled}
            title={`Couleur ${level + 1} sur ${COLLECTION_TREE_LEVEL_BORDER_HEX.length}`}
          />
        ))}
        <PaletteDot
          level={null}
          hex="#cbd5e1"
          disabled={props.disabled}
          title="Effacer la couleur sur la vignette cible"
        />
      </div>
    </div>
  );
}
