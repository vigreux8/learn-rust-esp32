import { useCallback, useMemo } from "preact/hooks";
import { addEdge, useEdgesState, useNodesState, type Connection } from "@xyflow/react";
import { flowEdgeTypes, flowNodeTypes } from "../../node/config/flow.registry";
import type { AppEdge, AppNode } from "../../node/config/flow.types";
import { DEFAULT_COLLECTION_NODE_DATA } from "../../node/costumeNode/CollectionNode";

/**
 * État minimal du canvas : un `CollectionNode` par défaut et connexions basiques.
 */
export function useNodeViewFlow() {
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

  const [nodes, , onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  return {
    flow: {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      nodeTypes: flowNodeTypes,
      edgeTypes: flowEdgeTypes,
    },
  };
}
