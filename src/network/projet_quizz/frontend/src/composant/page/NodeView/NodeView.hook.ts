import { useCallback, useMemo } from "preact/hooks";
import {
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
} from "@xyflow/react";
import { flowEdgeTypes, flowNodeTypes } from "../../node/config/flow.registry";
import type { AppEdge, AppNode } from "../../node/config/flow.types";
import { DEFAULT_COLLECTION_NODE_DATA } from "../../node/costumeNode/CollectionNode";
import { readReactFlowDnDFromEvent } from "../../ui/organismes/FlowSidebarOverlay/FlowSidebarOverlay.metier";
import { NODE_VIEW_SIDEBAR_DATA } from "./NodeView.metier";
import type { NodeViewProps } from "./NodeView.types";

/**
 * État du canvas `/node` : nœuds, arêtes, drop depuis la sidebar, données sidebar démo.
 */
export function useNodeViewFlow(page: Pick<NodeViewProps, "actions"> = {}) {
  const onNodeCreate = page.actions?.onNodeCreate;
  const { screenToFlowPosition } = useReactFlow<AppNode, AppEdge>();

  const initialNodes = useMemo<AppNode[]>(
    () => [
      {
        id: "collection-default",
        type: "collectionNode",
        position: { x: 48, y: 48 },
        data: DEFAULT_COLLECTION_NODE_DATA,
      },
    ],
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const parsed = readReactFlowDnDFromEvent(event);
      if (parsed == null) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `node_${Date.now()}`;

      if (parsed.type === "collectionNode") {
        const patch = (parsed.data ?? {}) as { label?: unknown };
        const label =
          typeof patch.label === "string" ? patch.label : DEFAULT_COLLECTION_NODE_DATA.label;
        const newNode: AppNode = {
          id,
          type: "collectionNode",
          position,
          data: {
            ...DEFAULT_COLLECTION_NODE_DATA,
            label,
          },
        };
        setNodes((nds) => nds.concat(newNode));
        onNodeCreate?.(parsed.type, position, newNode.data);
        return;
      }

      if (parsed.type === "questionNode") {
        const patch = (parsed.data ?? {}) as { title?: unknown };
        const title = typeof patch.title === "string" ? patch.title : "Question";
        const newNode: AppNode = {
          id,
          type: "questionNode",
          position,
          data: { title },
        };
        setNodes((nds) => nds.concat(newNode));
        onNodeCreate?.(parsed.type, position, newNode.data);
      }
    },
    [onNodeCreate, screenToFlowPosition, setNodes],
  );

  return {
    flow: {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onDrop,
      onDragOver,
      nodeTypes: flowNodeTypes,
      edgeTypes: flowEdgeTypes,
    },
    sidebar: {
      data: NODE_VIEW_SIDEBAR_DATA,
      actions: {
        onNodeCreate,
      },
    },
  };
}
