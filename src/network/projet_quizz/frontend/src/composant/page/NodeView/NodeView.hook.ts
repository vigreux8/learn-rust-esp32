import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import {
  addEdge,
  applyEdgeChanges,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type IsValidConnection,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import {
  createEmptyCollection,
  createPersonaliteCollection,
  fetchCollections,
  fetchPersonalitesPicker,
  fetchQuestions,
  linkCollectionParentCollection,
  postMoveQuestionToCollection,
  unlinkCollectionParentCollection,
} from "../../../lib/api";
import type { NodeViewGraphActionsValue } from "../../../lib/nodeViewGraphActionsContext";
import { useUserSession } from "../../../lib/userSession";
import { flowEdgeTypes, flowNodeTypes } from "../../node/config/flow.registry";
import type { AppEdge, AppNode } from "../../node/config/flow.types";
import { DEFAULT_COLLECTION_NODE_DATA } from "../../node/costumeNode/CollectionNode";
import { readReactFlowDnDFromEvent } from "../../../lib/reactFlowDnD";
import { readStoredNodeViewGraph, writeStoredNodeViewGraph } from "../../../lib/nodeViewGraphSession";
import type { CollectionUi, QuizzQuestionRow } from "../../../types/quizz";
import {
  buildCollectionSubtreeGraphElements,
  buildHierarchyQuestionSidebarRows,
  buildNodeViewSidebarData,
  filterQuestionRowsForCollectionSubtree,
  collectionParentChildEdgeId,
  collectionUiToCollectionNodeData,
  hydrateCollectionNodesTreeDepthFromCollections,
  isHierarchyCollectionConnectionValid,
  parseCollectionParentChildEdgeId,
  resolveQuestionsScopeCollectionIdFromSelection,
} from "./NodeView.metier";
import { useNodeViewPlayMode } from "./hooks/useNodeViewPlayMode";
import type { NodeViewProps } from "./NodeView.types";

/**
 * État du canvas `/node` : nœuds, arêtes, drop depuis la sidebar, données collections / questions depuis l’API.
 */
export function useNodeViewFlow(page: Pick<NodeViewProps, "actions"> = {}) {
  const onNodeCreate = page.actions?.onNodeCreate;
  const { userId } = useUserSession();
  const { screenToFlowPosition, fitView, getNode, getViewport, setViewport } = useReactFlow<AppNode, AppEdge>();

  const graphBootstrap = useMemo(() => readStoredNodeViewGraph(), []);
  const shouldRestoreGraph = Boolean(graphBootstrap?.nodes?.length);

  const defaultDemoNodes = useMemo<AppNode[]>(
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

  const initialNodesForCanvas =
    shouldRestoreGraph && graphBootstrap != null ? graphBootstrap.nodes : defaultDemoNodes;
  const initialEdgesForCanvas =
    shouldRestoreGraph && graphBootstrap != null ? graphBootstrap.edges : [];

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodesForCanvas);
  const [edges, setEdges] = useEdgesState<AppEdge>(initialEdgesForCanvas);

  const [apiCollections, setApiCollections] = useState<CollectionUi[]>([]);
  const [questionsScopeCollectionId, setQuestionsScopeCollectionId] = useState<number | null>(
    () => graphBootstrap?.questionsScopeCollectionId ?? null,
  );
  const [graphCreateNormaleOpen, setGraphCreateNormaleOpen] = useState(false);
  const [graphCreatePersoOpen, setGraphCreatePersoOpen] = useState(false);
  const [pendingGraphNodePosition, setPendingGraphNodePosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [graphNormaleBusy, setGraphNormaleBusy] = useState(false);
  const [graphPersoBusy, setGraphPersoBusy] = useState(false);
  const [graphNormaleError, setGraphNormaleError] = useState<string | null>(null);
  const [graphPersoError, setGraphPersoError] = useState<string | null>(null);

  const [llmImportModalCollectionId, setLlmImportModalCollectionId] = useState<number | null>(null);
  const [llmImportQuestions, setLlmImportQuestions] = useState<QuizzQuestionRow[]>([]);
  const [llmImportQuestionsLoading, setLlmImportQuestionsLoading] = useState(false);
  const [llmImportQuestionsError, setLlmImportQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchCollections();
        if (!cancelled) setApiCollections(list);
      } catch {
        if (!cancelled) setApiCollections([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (llmImportModalCollectionId == null) {
      setLlmImportQuestions([]);
      setLlmImportQuestionsError(null);
      setLlmImportQuestionsLoading(false);
      return;
    }
    let cancelled = false;
    setLlmImportQuestionsLoading(true);
    setLlmImportQuestionsError(null);
    void fetchQuestions(llmImportModalCollectionId)
      .then((rows) => {
        if (!cancelled) {
          setLlmImportQuestions(rows);
          setLlmImportQuestionsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLlmImportQuestionsError("Impossible de charger les questions de la collection.");
          setLlmImportQuestionsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [llmImportModalCollectionId]);

  const collectionByIdForGraph = useMemo(
    () => new Map(apiCollections.map((c) => [c.id, c])),
    [apiCollections],
  );

  useEffect(() => {
    if (apiCollections.length === 0) return;
    setNodes((nds) => hydrateCollectionNodesTreeDepthFromCollections(nds, apiCollections, userId));
  }, [apiCollections, setNodes, userId]);

  useLayoutEffect(() => {
    if (!shouldRestoreGraph) return;
    const vp = graphBootstrap?.viewport;
    const apply = () => {
      if (vp != null) {
        void setViewport(vp);
      } else {
        void fitView({ padding: 0.22, duration: 0 });
      }
    };
    queueMicrotask(apply);
    const raf = requestAnimationFrame(() => requestAnimationFrame(apply));
    return () => cancelAnimationFrame(raf);
  }, [fitView, graphBootstrap, setViewport, shouldRestoreGraph]);

  useEffect(() => {
    const pack = () => {
      try {
        writeStoredNodeViewGraph({
          nodes,
          edges,
          viewport: getViewport(),
          questionsScopeCollectionId,
        });
      } catch {
        /* ignore quota / mode privé */
      }
    };
    const t = window.setTimeout(pack, 120);
    const onPageHide = () => pack();
    const onVis = () => {
      if (document.visibilityState === "hidden") pack();
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [nodes, edges, questionsScopeCollectionId, getViewport]);

  const graphSessionFlushRef = useRef({
    nodes,
    edges,
    questionsScopeCollectionId,
    getViewport,
  });
  graphSessionFlushRef.current = { nodes, edges, questionsScopeCollectionId, getViewport };

  useEffect(() => {
    return () => {
      const snap = graphSessionFlushRef.current;
      try {
        writeStoredNodeViewGraph({
          nodes: snap.nodes,
          edges: snap.edges,
          viewport: snap.getViewport(),
          questionsScopeCollectionId: snap.questionsScopeCollectionId,
        });
      } catch {
        /* ignore */
      }
    };
  }, []);

  const onEdgesChange = useCallback(
    (changes: EdgeChange<AppEdge>[]) => {
      setEdges((eds) => {
        const toUnlink: { childId: number; edge: AppEdge }[] = [];
        for (const ch of changes) {
          if (ch.type !== "remove") continue;
          const edge = eds.find((e) => e.id === ch.id);
          if (!edge) continue;
          const parsed = parseCollectionParentChildEdgeId(edge.id);
          if (parsed != null) {
            toUnlink.push({ childId: parsed.childId, edge });
          }
        }
        const next = applyEdgeChanges(changes, eds);
        for (const item of toUnlink) {
          queueMicrotask(() => {
            void unlinkCollectionParentCollection(item.childId, userId)
              .then(async () => {
                const list = await fetchCollections();
                setApiCollections(list);
                setNodes((nds) => hydrateCollectionNodesTreeDepthFromCollections(nds, list, userId));
              })
              .catch((e: unknown) => {
                window.alert(
                  e instanceof Error ? e.message : "Impossible de retirer le lien parent / enfant.",
                );
                setEdges((cur) => (cur.some((eRow) => eRow.id === item.edge.id) ? cur : [...cur, item.edge]));
              });
          });
        }
        return next;
      });
    },
    [setEdges, setNodes, userId],
  );

  const isValidConnection = useCallback<IsValidConnection<AppEdge>>(
    (edgeOrConn) => isHierarchyCollectionConnectionValid(edgeOrConn, getNode),
    [getNode],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isHierarchyCollectionConnectionValid(connection, getNode)) return;
      const src = getNode(connection.source!);
      const tgt = getNode(connection.target!);
      if (src?.type !== "collectionNode" || tgt?.type !== "collectionNode") return;
      const parentId = src.data.collectionId;
      const childId = tgt.data.collectionId;
      if (typeof parentId !== "number" || typeof childId !== "number") return;
      const edgeId = collectionParentChildEdgeId(parentId, childId);
      void (async () => {
        try {
          await linkCollectionParentCollection(childId, { userId, parentId });
          const list = await fetchCollections();
          setApiCollections(list);
          setNodes((nds) => hydrateCollectionNodesTreeDepthFromCollections(nds, list, userId));
          setEdges((eds) => {
            if (eds.some((eRow) => eRow.id === edgeId)) return eds;
            return addEdge(
              {
                ...connection,
                id: edgeId,
                source: connection.source!,
                target: connection.target!,
                sourceHandle: connection.sourceHandle ?? undefined,
                targetHandle: connection.targetHandle ?? undefined,
              },
              eds,
            );
          });
        } catch (e: unknown) {
          window.alert(e instanceof Error ? e.message : "Lien parent → enfant refusé.");
        }
      })();
    },
    [getNode, setApiCollections, setEdges, setNodes, userId],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onSelectionChange = useCallback<OnSelectionChangeFunc<AppNode, AppEdge>>(({ nodes: selNodes }) => {
    const flagged = selNodes.filter((n) => n.selected);
    const selected = flagged.length > 0 ? flagged : selNodes;
    setQuestionsScopeCollectionId(resolveQuestionsScopeCollectionIdFromSelection(selected));
  }, []);

  const onPaneClick = useCallback(() => {
    setQuestionsScopeCollectionId(null);
  }, []);

  const closeGraphNormaleModal = useCallback(() => {
    if (graphNormaleBusy) return;
    setGraphCreateNormaleOpen(false);
    setPendingGraphNodePosition(null);
    setGraphNormaleError(null);
  }, [graphNormaleBusy]);

  const closeGraphPersoModal = useCallback(() => {
    if (graphPersoBusy) return;
    setGraphCreatePersoOpen(false);
    setPendingGraphNodePosition(null);
    setGraphPersoError(null);
  }, [graphPersoBusy]);

  const submitGraphNormaleCollection = useCallback(
    async (payload: { nom: string; tagCollectionId: number | "" }) => {
      if (pendingGraphNodePosition == null) return;
      const pos = pendingGraphNodePosition;
      setGraphNormaleBusy(true);
      setGraphNormaleError(null);
      try {
        const body: { userId: number; nom: string; tagCollectionId?: number } = {
          userId,
          nom: payload.nom,
        };
        if (payload.tagCollectionId !== "") body.tagCollectionId = Number(payload.tagCollectionId);
        const ui = await createEmptyCollection(body);
        const list = await fetchCollections();
        setApiCollections(list);
        const byId = new Map(list.map((c) => [c.id, c]));
        const nodeId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `node_${Date.now()}`;
        const newNode: AppNode = {
          id: nodeId,
          type: "collectionNode",
          position: pos,
          data: collectionUiToCollectionNodeData(ui, byId, userId),
        };
        setNodes((nds) => nds.concat(newNode));
        setGraphCreateNormaleOpen(false);
        setPendingGraphNodePosition(null);
        onNodeCreate?.("collectionNode", pos, newNode.data);
      } catch (e: unknown) {
        setGraphNormaleError(e instanceof Error ? e.message : "Création impossible.");
      } finally {
        setGraphNormaleBusy(false);
      }
    },
    [onNodeCreate, pendingGraphNodePosition, setNodes, userId],
  );

  const submitGraphPersonnalite = useCallback(
    async (payload: {
      nom: string;
      prenom: string;
      naissance: number;
      mort: number | null;
      resumer: string;
      tagCollectionId: number | "";
    }) => {
      if (pendingGraphNodePosition == null) return;
      const pos = pendingGraphNodePosition;
      setGraphPersoBusy(true);
      setGraphPersoError(null);
      try {
        const ui = await createPersonaliteCollection({
          userId,
          nom: payload.nom,
          prenom: payload.prenom,
          naissance: payload.naissance,
          mort: payload.mort,
          resumer: payload.resumer,
          ...(payload.tagCollectionId !== "" ? { tagCollectionId: Number(payload.tagCollectionId) } : {}),
        });
        const list = await fetchCollections();
        setApiCollections(list);
        void fetchPersonalitesPicker().catch(() => undefined);
        const byId = new Map(list.map((c) => [c.id, c]));
        const nodeId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `node_${Date.now()}`;
        const newNode: AppNode = {
          id: nodeId,
          type: "collectionNode",
          position: pos,
          data: collectionUiToCollectionNodeData(ui, byId, userId),
        };
        setNodes((nds) => nds.concat(newNode));
        setGraphCreatePersoOpen(false);
        setPendingGraphNodePosition(null);
        onNodeCreate?.("collectionNode", pos, newNode.data);
      } catch (e: unknown) {
        setGraphPersoError(e instanceof Error ? e.message : "Création impossible.");
      } finally {
        setGraphPersoBusy(false);
      }
    },
    [onNodeCreate, pendingGraphNodePosition, setNodes, userId],
  );

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
        const patch = (parsed.data ?? {}) as {
          label?: unknown;
          collectionId?: unknown;
          blankTemplate?: unknown;
        };
        const blankTemplate = patch.blankTemplate === true;
        const labelFallback =
          typeof patch.label === "string" ? patch.label : DEFAULT_COLLECTION_NODE_DATA.label;
        const cid = typeof patch.collectionId === "number" ? patch.collectionId : null;
        const coll = cid != null ? apiCollections.find((c) => c.id === cid) : undefined;

        if (blankTemplate) {
          setPendingGraphNodePosition(position);
          setGraphNormaleError(null);
          setGraphCreateNormaleOpen(true);
          return;
        }

        const newNode: AppNode =
          coll != null
            ? {
                id,
                type: "collectionNode",
                position,
                data: collectionUiToCollectionNodeData(coll, collectionByIdForGraph, userId),
              }
            : {
                id,
                type: "collectionNode",
                position,
                data: {
                  ...DEFAULT_COLLECTION_NODE_DATA,
                  label: labelFallback,
                },
              };
        setNodes((nds) => nds.concat(newNode));
        onNodeCreate?.(parsed.type, position, newNode.data);
        return;
      }

      if (parsed.type === "questionNode") {
        const patch = (parsed.data ?? {}) as {
          title?: unknown;
          collectionId?: unknown;
          questionId?: unknown;
        };
        const title = typeof patch.title === "string" ? patch.title : "Question";
        const collectionId = typeof patch.collectionId === "number" ? patch.collectionId : null;
        const questionId = typeof patch.questionId === "number" ? patch.questionId : null;
        const newNode: AppNode = {
          id,
          type: "questionNode",
          position,
          data: {
            title,
            collectionId,
            ...(questionId != null ? { questionId } : {}),
          },
        };
        setNodes((nds) => nds.concat(newNode));
        onNodeCreate?.(parsed.type, position, newNode.data);
        return;
      }

      if (parsed.type === "personalityNode") {
        const patch = (parsed.data ?? {}) as {
          label?: unknown;
          importanceType?: unknown;
          personaliteId?: unknown;
          collectionLabel?: unknown;
          ficheCollectionId?: unknown;
          blankTemplate?: unknown;
        };
        const blankTemplate = patch.blankTemplate === true;
        if (blankTemplate) {
          setPendingGraphNodePosition(position);
          setGraphPersoError(null);
          setGraphCreatePersoOpen(true);
          return;
        }
        const label = typeof patch.label === "string" ? patch.label : "Personnalité";
        const importanceType =
          patch.importanceType === null || patch.importanceType === undefined
            ? null
            : typeof patch.importanceType === "string"
              ? patch.importanceType
              : null;
        const personaliteId = typeof patch.personaliteId !== "number" ? undefined : patch.personaliteId;
        const collectionLabel = typeof patch.collectionLabel !== "string" ? undefined : patch.collectionLabel;
        const ficheCollectionId =
          typeof patch.ficheCollectionId !== "number" ? undefined : patch.ficheCollectionId;
        const newNode: AppNode = {
          id,
          type: "personalityNode",
          position,
          data: {
            label,
            importanceType,
            personaliteId,
            collectionLabel,
            ficheCollectionId,
          },
        };
        setNodes((nds) => nds.concat(newNode));
        onNodeCreate?.(parsed.type, position, newNode.data);
      }
    },
    [apiCollections, collectionByIdForGraph, onNodeCreate, screenToFlowPosition, setNodes],
  );

  const onShowCollectionSubtreeOnGraph = useCallback(
    (collectionId: number) => {
      const { nodes: nextNodes, edges: nextEdges } = buildCollectionSubtreeGraphElements(
        collectionId,
        apiCollections,
        userId,
      );
      if (nextNodes.length === 0) return;
      setNodes(nextNodes);
      setEdges(nextEdges);
      queueMicrotask(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            void fitView({ padding: 0.22, duration: 280 });
          });
        });
      });
    },
    [apiCollections, fitView, setEdges, setNodes, userId],
  );

  const sidebarBase = useMemo(() => buildNodeViewSidebarData(apiCollections), [apiCollections]);

  const hierarchyQuestionRows = useMemo(
    () => buildHierarchyQuestionSidebarRows(apiCollections),
    [apiCollections],
  );

  /** Collections représentées sur le canvas (ids API uniquement — pas le gabarit démo). */
  const questionsCanvasCollectionScope = useMemo(() => {
    const idsOnCanvas = new Set<number>();
    for (const n of nodes) {
      if (n.type === "collectionNode") {
        const cid = n.data.collectionId;
        if (typeof cid === "number") idsOnCanvas.add(cid);
      } else if (n.type === "questionNode") {
        const cid = n.data.collectionId;
        if (typeof cid === "number") idsOnCanvas.add(cid);
      }
    }
    const orderedIds =
      idsOnCanvas.size === 0
        ? ([] as number[])
        : sidebarBase.collections.map((r) => r.collectionId).filter((id) => idsOnCanvas.has(id));
    return { idsOnCanvas, orderedIds };
  }, [nodes, sidebarBase.collections]);

  const sidebarData = useMemo(() => {
    const merged = {
      ...sidebarBase,
      questions: hierarchyQuestionRows.filter((row) =>
        questionsCanvasCollectionScope.idsOnCanvas.has(row.collectionId),
      ),
    };
    if (questionsScopeCollectionId == null) {
      return merged;
    }
    return {
      collections: merged.collections,
      questions: filterQuestionRowsForCollectionSubtree(
        merged.questions,
        questionsScopeCollectionId,
        merged.collectionHierarchy,
      ),
      personalities: merged.personalities,
      collectionHierarchy: merged.collectionHierarchy,
    };
  }, [hierarchyQuestionRows, questionsCanvasCollectionScope, questionsScopeCollectionId, sidebarBase]);

  const questionsPanelHint = useMemo(() => {
    const canvasIntro =
      "Seules les collections présentes comme nœuds sur le graphe (collection ou question avec id API) : questions et blocs correspondent à cette vue. Ordre hiérarchique ; glisser-déposer pour changer de collection.";

    if (questionsCanvasCollectionScope.orderedIds.length === 0) {
      return `${canvasIntro} Aucune collection API sur le graphe : utilise « Filtrer collections » pour en déposer, ou recharge une branche.`;
    }

    if (questionsScopeCollectionId == null) {
      return `${canvasIntro} Sélectionne un nœud collection pour ne voir que sa branche (sous-arbre parmi ces nœuds).`;
    }

    const coll = apiCollections.find((c) => c.id === questionsScopeCollectionId);
    return coll != null
      ? `${canvasIntro} Branche « ${coll.nom} » : bloc racine déplié par défaut, enfants repliés jusqu’au clic.`
      : `${canvasIntro} Vue restreinte à la sous-branche de la sélection sur le graphe.`;
  }, [apiCollections, questionsCanvasCollectionScope, questionsScopeCollectionId]);

  const graphTagPickerOptions = useMemo(
    () => apiCollections.map((c) => ({ id: c.id, nom: c.nom })),
    [apiCollections],
  );

  const closeLlmImportModal = useCallback(() => {
    setLlmImportModalCollectionId(null);
    setLlmImportQuestions([]);
    setLlmImportQuestionsError(null);
  }, []);

  const openLlmImportForCollection = useCallback((collectionId: number) => {
    setLlmImportModalCollectionId(collectionId);
  }, []);

  const handleLlmImportModalImportSuccess = useCallback(() => {
    void (async () => {
      try {
        const list = await fetchCollections();
        setApiCollections(list);
        setNodes((nds) => hydrateCollectionNodesTreeDepthFromCollections(nds, list, userId));
      } catch {
        /* ignore */
      }
      closeLlmImportModal();
    })();
  }, [closeLlmImportModal, setNodes, userId]);

  const playModeUi = useNodeViewPlayMode({ userId });

  const moveQuestionToCollection = useCallback(
    async (args: { questionId: number; fromCollectionId: number; toCollectionId: number }) => {
      const { questionId, fromCollectionId, toCollectionId } = args;
      if (fromCollectionId === toCollectionId) return;
      try {
        await postMoveQuestionToCollection(questionId, {
          user_id: userId,
          from_collection_id: fromCollectionId,
          to_collection_id: toCollectionId,
        });
        const list = await fetchCollections();
        setApiCollections(list);
        setNodes((nds) =>
          hydrateCollectionNodesTreeDepthFromCollections(
            nds.map((n) =>
              n.type === "questionNode" && n.data.questionId === questionId
                ? { ...n, data: { ...n.data, collectionId: toCollectionId } }
                : n,
            ),
            list,
            userId,
          ),
        );
      } catch (e: unknown) {
        window.alert(e instanceof Error ? e.message : "Impossible de déplacer la question.");
      }
    },
    [setNodes, userId],
  );

  const graphActions = useMemo<NodeViewGraphActionsValue>(
    () => ({
      moveQuestionToCollection,
      openLlmImportForCollection,
      navigateToPlayForCollection: playModeUi.play.navigateToPlayForCollection,
    }),
    [moveQuestionToCollection, openLlmImportForCollection, playModeUi.play.navigateToPlayForCollection],
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
      onSelectionChange,
      onPaneClick,
      isValidConnection,
      nodeTypes: flowNodeTypes,
      edgeTypes: flowEdgeTypes,
      reactFlowFitView: !shouldRestoreGraph,
    },
    sidebar: {
      data: sidebarData,
      actions: {
        ...page.actions,
        onShowCollectionSubtreeOnGraph,
        onMoveQuestionToCollection: moveQuestionToCollection,
      },
      presentation: {
        questionsPanelHint,
        questionsDetailsExpandCollectionId: questionsScopeCollectionId,
        questionsCanvasCollectionIds: questionsCanvasCollectionScope.orderedIds,
      },
    },
    graphActions,
    llmImportModal: {
      open: llmImportModalCollectionId != null,
      collectionId: llmImportModalCollectionId,
      collections: apiCollections,
      questions: llmImportQuestions,
      questionsLoading: llmImportQuestionsLoading,
      questionsError: llmImportQuestionsError,
      onClose: closeLlmImportModal,
      onImportSuccess: handleLlmImportModalImportSuccess,
    },
    playModePanel: playModeUi,
    graphModals: {
      normale: {
        open: graphCreateNormaleOpen,
        busy: graphNormaleBusy,
        error: graphNormaleError,
        tagOptions: graphTagPickerOptions,
        onClose: closeGraphNormaleModal,
        onSubmit: (p: { nom: string; tagCollectionId: number | "" }) => void submitGraphNormaleCollection(p),
      },
      personnalite: {
        open: graphCreatePersoOpen,
        busy: graphPersoBusy,
        error: graphPersoError,
        tagOptions: graphTagPickerOptions,
        onClose: closeGraphPersoModal,
        onSubmit: (payload: {
          nom: string;
          prenom: string;
          naissance: number;
          mort: number | null;
          resumer: string;
          tagCollectionId: number | "";
        }) => void submitGraphPersonnalite(payload),
      },
    },
  };
}
