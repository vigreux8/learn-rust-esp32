import type { Edge } from "@xyflow/react";

export type CollectionEdgeData = Record<string, never>;

export type CollectionEdgeType = Edge<CollectionEdgeData, "collectionEdge">;
