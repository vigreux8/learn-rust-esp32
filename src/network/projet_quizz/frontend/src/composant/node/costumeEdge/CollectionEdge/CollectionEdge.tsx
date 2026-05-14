import { BaseEdge, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import type { CollectionEdgeType } from "./CollectionEdge.types";

export function CollectionEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps<CollectionEdgeType>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g class="group">
      {/* Trait de fond (hitbox plus large pour le hover/clic) */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        class="cursor-crosshair"
      />
      
      {/* Trait principal statique */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        className={`stroke-[2.5] !fill-none transition-all duration-300 ease-out cursor-crosshair ${
          selected
            ? "stroke-flow drop-shadow-md"
            : "stroke-base-content/15 group-hover:stroke-flow/50"
        }`}
      />
      
      {/* Animation de particules uniquement quand sélectionné ou survolé */}
      <circle
        r={selected ? "4" : "3"}
        class={`fill-flow transition-opacity duration-300 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <animateMotion dur={selected ? "1.5s" : "2.5s"} repeatCount="indefinite" path={edgePath} />
      </circle>
    </g>
  );
}
