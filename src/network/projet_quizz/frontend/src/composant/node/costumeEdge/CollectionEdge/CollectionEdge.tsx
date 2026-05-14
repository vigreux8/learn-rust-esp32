import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import type { AppEdge, AppNode } from "../../config/flow.types";
import type { CollectionEdgeType } from "./CollectionEdge.types";

export function CollectionEdge(props: EdgeProps<CollectionEdgeType>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    selected,
  } = props;

  const { deleteElements } = useReactFlow<AppNode, AppEdge>();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onRemoveClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <g class="group">
        <path
          d={edgePath}
          fill="none"
          strokeOpacity={0}
          strokeWidth={20}
          class="cursor-crosshair"
          title="Sélectionner l’arête puis Suppr. ou Retour arrière pour retirer le lien parent → enfant (détache la collection en base)."
        />

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

        <circle
          r={selected ? "4" : "3"}
          class={`fill-flow transition-opacity duration-300 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <animateMotion dur={selected ? "1.5s" : "2.5s"} repeatCount="indefinite" path={edgePath} />
        </circle>
      </g>

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute left-0 top-0 z-[120]"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <button
            type="button"
            className="flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full border border-base-content/25 bg-base-100/95 p-0 text-[10px] font-light leading-none text-base-content/50 shadow-sm transition hover:border-error/45 hover:bg-error/10 hover:text-error"
            aria-label="Retirer le lien parent vers enfant"
            title="Retirer le lien (détache l’enfant en base)"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemoveClick}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
