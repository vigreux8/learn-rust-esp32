import { useCallback, useMemo, useState } from "preact/hooks";
import { useReactFlow } from "@xyflow/react";
import {
  useNodeViewGraphActions,
  type NodeViewGraphUpdatePersonaliteImportanceArgs,
} from "../../../../lib/nodeViewGraphActionsContext";
import { normalizeQuestionNodeMovePayload, normalizeReflexionGroupeNodeMovePayload, readReactFlowDnDFromEvent } from "../../../../lib/reactFlowDnD";
import type { AppEdge, AppNode } from "../../config/flow.types";
import {
  mergeInfluenceurFromSidebarPayload,
  mergeSupercollectionFromSidebarPayload,
} from "./CollectionNode.metier";
import type { InfluenceurRolePick } from "./parts/CreatorPanel/CreatorPanel.metier";
import type {
  CollectionNodeCreatorPanelInput,
  CollectionNodeProps,
  CollectionNodeSupercollectionsPanelInput,
  CollectionNodeViewStates,
} from "./CollectionNode.types";

/**
 * Orchestration locale du nœud (expansion, drop sidebar sur tout le nœud → # ou influenceurs).
 */
export function useCollectionNode(props: CollectionNodeProps): CollectionNodeViewStates {
  const { data, id } = props;
  const [savingPersonaliteId, setSavingPersonaliteId] = useState<number | null>(null);
  const [savingTagCollectionId, setSavingTagCollectionId] = useState<number | null>(null);
  const { setNodes } = useReactFlow<AppNode, AppEdge>();
  const graphActions = useNodeViewGraphActions();

  const isExpanded = data.sidePanelsOpen === true;

  const toggle = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== id || node.type !== "collectionNode") return node;
        const cur = node.data.sidePanelsOpen === true;
        return { ...node, data: { ...node.data, sidePanelsOpen: !cur } };
      }),
    );
  }, [id, setNodes]);

  const onTogglePlayIncluded = useCallback(
    (e: Event) => {
      e.stopPropagation();
      if (typeof data.collectionId !== "number") return;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== id || node.type !== "collectionNode") return node;
          const cur = node.data.playIncluded !== false;
          return { ...node, data: { ...node.data, playIncluded: !cur } };
        }),
      );
    },
    [data.collectionId, id, setNodes],
  );

  const onPlay = useCallback(() => {
    const cid = typeof data.collectionId === "number" ? data.collectionId : null;
    if (cid != null && graphActions?.navigateToPlayForCollection != null) {
      graphActions.navigateToPlayForCollection(cid);
      return;
    }
    if (cid == null) {
      window.alert(
        "Ce nœud n’est pas relié à une collection en base : dépose une collection depuis la barre latérale ou recharge une branche.",
      );
      return;
    }
    data.actions?.onPlay?.(id);
  }, [data.actions, data.collectionId, graphActions, id]);

  const onNodeDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }, []);

  const onNodeDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const parsed = readReactFlowDnDFromEvent(event);
      if (parsed == null) return;

      if (parsed.type === "collectionNode") {
        const record = parsed.data as Record<string, unknown>;
        if (record.blankTemplate === true) {
          return;
        }
        const tagCollectionId = typeof record.collectionId === "number" ? record.collectionId : null;
        const taggedCollectionId = typeof data.collectionId === "number" ? data.collectionId : null;
        const assignTag = graphActions?.assignCollectionTagOnGraph;

        if (
          tagCollectionId != null &&
          taggedCollectionId != null &&
          tagCollectionId !== taggedCollectionId &&
          assignTag != null
        ) {
          void assignTag({ taggedCollectionId, tagCollectionId });
          return;
        }

        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== id || node.type !== "collectionNode") return node;
            const merged = mergeSupercollectionFromSidebarPayload(
              node.data.supercollections ?? [],
              parsed.data,
            );
            if (merged == null) return node;
            return { ...node, data: { ...node.data, supercollections: merged } };
          }),
        );
        return;
      }

      if (parsed.type === "personalityNode") {
        const toCollectionId = typeof data.collectionId === "number" ? data.collectionId : null;
        const record = parsed.data as Record<string, unknown>;
        const pidRaw = record.personaliteId;
        const personaliteId = typeof pidRaw === "number" ? pidRaw : null;
        const persist = graphActions?.updatePersonaliteImportanceOnCollection;

        if (toCollectionId != null && personaliteId != null && persist != null) {
          const importanceType = parsePersonalityDropImportanceType(record);
          void persist({ collectionId: toCollectionId, personaliteId, importanceType });
          return;
        }

        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== id || node.type !== "collectionNode") return node;
            const merged = mergeInfluenceurFromSidebarPayload(node.data.creators ?? [], parsed.data);
            if (merged == null) return node;
            return { ...node, data: { ...node.data, creators: merged } };
          }),
        );
        return;
      }

      if (parsed.type === "questionNode") {
        const toCollectionId = data.collectionId;
        if (typeof toCollectionId !== "number") {
          window.alert("Dépose sur un nœud collection relié à l’API (pas le gabarit vide).");
          return;
        }
        const { fromCollectionId, questionIds } = normalizeQuestionNodeMovePayload(parsed.data);
        if (questionIds.length === 0 || fromCollectionId == null) {
          window.alert(
            "Seules les questions déjà liées à une collection (liste ou nœud avec poignée) peuvent être déplacées.",
          );
          return;
        }
        if (fromCollectionId === toCollectionId) {
          return;
        }
        const moveQuestionToCollection = graphActions?.moveQuestionToCollection;
        if (moveQuestionToCollection == null) {
          window.alert("Action de déplacement non disponible sur ce graphe.");
          return;
        }
        void moveQuestionToCollection({
          questionId: questionIds[0],
          fromCollectionId,
          toCollectionId,
          ...(questionIds.length > 1 ? { questionIds } : {}),
        });
        return;
      }

      if (parsed.type === "reflexionGroupeNode") {
        const toCollectionId = data.collectionId;
        if (typeof toCollectionId !== "number") {
          window.alert("Dépose sur un nœud collection relié à l’API (pas le gabarit vide).");
          return;
        }
        const { fromCollectionId, groupeIds } = normalizeReflexionGroupeNodeMovePayload(parsed.data);
        if (groupeIds.length === 0 || fromCollectionId == null) {
          window.alert("Seules les suites logiques de la barre latérale peuvent être déplacées ainsi.");
          return;
        }
        if (fromCollectionId === toCollectionId) {
          return;
        }
        const moveGroupeToCollection = graphActions?.moveGroupeToCollection;
        if (moveGroupeToCollection == null) {
          window.alert("Action de déplacement non disponible sur ce graphe.");
          return;
        }
        void moveGroupeToCollection({
          groupeId: groupeIds[0],
          fromCollectionId,
          toCollectionId,
          ...(groupeIds.length > 1 ? { groupeIds } : {}),
        });
      }
    },
    [data.collectionId, graphActions, id, setNodes],
  );

  const onRemoveSupercollectionTag = useCallback(
    (tagCollectionId: number) => {
      const taggedCollectionId = typeof data.collectionId === "number" ? data.collectionId : null;
      const unassignFn = graphActions?.unassignCollectionTagOnGraph;

      if (taggedCollectionId == null || unassignFn == null) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== id || node.type !== "collectionNode") return node;
            const supercollections = (node.data.supercollections ?? []).filter(
              (c) => Number(c.id) !== tagCollectionId,
            );
            return { ...node, data: { ...node.data, supercollections } };
          }),
        );
        return;
      }

      void (async () => {
        setSavingTagCollectionId(tagCollectionId);
        try {
          await unassignFn({ taggedCollectionId, tagCollectionId });
        } catch {
          /* alerte côté NodeView */
        } finally {
          setSavingTagCollectionId(null);
        }
      })();
    },
    [data.collectionId, graphActions, id, setNodes],
  );

  const supercollectionsPanel = useMemo<CollectionNodeSupercollectionsPanelInput>(
    () => ({
      data: { supercollections: data.supercollections ?? [] },
      settings: {
        tagRemoveEnabled: data.isMine === true && typeof data.collectionId === "number",
      },
      status: { savingTagCollectionId },
      actions: { onRemoveTag: onRemoveSupercollectionTag },
    }),
    [
      data.collectionId,
      data.isMine,
      data.supercollections,
      onRemoveSupercollectionTag,
      savingTagCollectionId,
    ],
  );

  const onRemoveCreator = useCallback(
    (personaliteId: number) => {
      const collectionId = typeof data.collectionId === "number" ? data.collectionId : null;
      const unassignFn = graphActions?.unassignPersonaliteFromCollectionOnGraph;
      if (collectionId == null || unassignFn == null) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== id || node.type !== "collectionNode") return node;
            const creators = (node.data.creators ?? []).filter((c) => Number(c.id) !== personaliteId);
            return { ...node, data: { ...node.data, creators } };
          }),
        );
        return;
      }
      void (async () => {
        setSavingPersonaliteId(personaliteId);
        try {
          await unassignFn({ collectionId, personaliteId });
        } catch {
          /* alerte côté NodeView */
        } finally {
          setSavingPersonaliteId(null);
        }
      })();
    },
    [data.collectionId, graphActions, id, setNodes],
  );

  const onCreatorRoleChange = useCallback(
    (personaliteId: number, importancePick: InfluenceurRolePick) => {
      const importanceType = importancePick === "" ? null : importancePick;
      const collectionId = typeof data.collectionId === "number" ? data.collectionId : null;
      const updater = graphActions?.updatePersonaliteImportanceOnCollection;

      if (collectionId == null || updater == null) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== id || node.type !== "collectionNode") return node;
            const creators = (node.data.creators ?? []).map((c) =>
              c.id === String(personaliteId) ? { ...c, importanceType } : c,
            );
            return { ...node, data: { ...node.data, creators } };
          }),
        );
        return;
      }

      void (async () => {
        setSavingPersonaliteId(personaliteId);
        try {
          await updater({ collectionId, personaliteId, importanceType });
        } catch {
          /* alerte côté NodeView */
        } finally {
          setSavingPersonaliteId(null);
        }
      })();
    },
    [data.collectionId, graphActions, id, setNodes],
  );

  const creatorPanel = useMemo<CollectionNodeCreatorPanelInput>(
    () => ({
      data: { creators: data.creators ?? [] },
      settings: {
        /** Sur `/node`, le contexte graphe suffit : l’API impose le propriétaire ; `isMine` seul bloquait l’UI à tort. */
        roleChangeEnabled:
          typeof data.collectionId === "number" &&
          (graphActions?.updatePersonaliteImportanceOnCollection != null || data.isMine === true),
      },
      status: { savingPersonaliteId },
      actions: { onRoleChange: onCreatorRoleChange, onRemoveCreator: onRemoveCreator },
    }),
    [
      data.collectionId,
      data.creators,
      data.isMine,
      graphActions?.updatePersonaliteImportanceOnCollection,
      onCreatorRoleChange,
      onRemoveCreator,
      savingPersonaliteId,
    ],
  );

  const collectionApiId = typeof data.collectionId === "number" ? data.collectionId : null;
  const playIncluded = data.playIncluded !== false;

  return {
    layout: { isExpanded, toggle },
    content: {
      title: data.label,
    },
    supercollectionsPanel,
    creatorPanel,
    dnd: {
      isOverBar: false,
      nodeSurface: {
        onDragOver: onNodeDragOver,
        onDragOverCapture: onNodeDragOver,
        onDrop: onNodeDrop,
      },
    },
    graphPlay: {
      showToggle: collectionApiId != null,
      included: playIncluded,
      onToggleIncluded: onTogglePlayIncluded,
    },
    actions: { onPlay },
  };
}

function parsePersonalityDropImportanceType(
  record: Record<string, unknown>,
): NodeViewGraphUpdatePersonaliteImportanceArgs["importanceType"] {
  const raw = record.importanceType;
  if (raw === "pionnier" || raw === "important" || raw === "secondaire") return raw;
  return null;
}
