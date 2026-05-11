import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";

import {
  COLLECTION_TREE_LEVEL_BORDER_HEX,
  collectionTreePaletteBucket,
  sortPersonnalitesForDisplay,
} from "../../../../lib/collectionHierarchyVis";
import {
  buildPlayOrdersFromPicker,
  buildPlaySessionQuery,
  playOrdersRequireUserId,
} from "../../../../lib/playOrder";

import { buildQuestionsRoutePath } from "./CollectionCard.metier";
import type { CollectionCardProps } from "./CollectionCard.types";

export function useCollectionCard(props: CollectionCardProps) {
  const {
    collection,
    myUserId,
    tagPickerPool,
    assignBusyCollectionId,
    deleteBusyCollectionId,
    interactionLocked = false,
    playMode,
    playQtype,
    playInfinite,
    treeDepth,
    personalitesPicker = [],
    assignPersoBusyCollectionId = null,
    onAssignPerso,
    onAssignTag,
    onUnassignTag,
    onDeleteCollection,
    onUnassignPerso,
    hierarchyViewToggle,
  } = props;

  const n = collection.questions.length;
  const uiLocked =
    interactionLocked ||
    assignBusyCollectionId !== null ||
    deleteBusyCollectionId !== null ||
    assignPersoBusyCollectionId !== null;
  const counts = collection.question_counts_by_type;
  const isMine = collection.user_id === myUserId;
  const [playSousCollectionId, setPlaySousCollectionId] = useState<number | "">("");
  const [importPick, setImportPick] = useState<"" | "pionnier" | "important" | "secondaire">("");
  const linkedTags = collection.collection_tags ?? [];
  const sousForPlay = collection.sous_collections ?? [];
  const sousChildren = collection.sous_collections ?? [];
  const personnalitesSorted = sortPersonnalitesForDisplay(collection.personnalites ?? []);
  const levelBorderIdx = collectionTreePaletteBucket(treeDepth);
  const collectionBorderHex = COLLECTION_TREE_LEVEL_BORDER_HEX[levelBorderIdx];

  const handleQuestionsClick = () => route(buildQuestionsRoutePath(collection.id, linkedTags));
  const handleCardClick = (event: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, select, textarea, label")) return;
    handleQuestionsClick();
  };

  const assignableTags = useMemo(() => {
    return tagPickerPool.filter(
      (row) => row.id !== collection.id && !linkedTags.some((l) => l.id === row.id),
    );
  }, [tagPickerPool, collection.id, linkedTags]);

  const persoPickable = useMemo(() => {
    if (!isMine || onAssignPerso == null || personalitesPicker.length === 0) return [];
    const linkedIds = new Set((collection.personnalites ?? []).map((x) => x.id));
    return personalitesPicker.filter(
      (row) => row.collection_id !== collection.id && !linkedIds.has(row.id),
    );
  }, [personalitesPicker, collection.id, collection.personnalites, isMine, onAssignPerso]);

  useEffect(() => setPlaySousCollectionId(""), [collection.id]);
  useEffect(() => {
    setImportPick("");
  }, [collection.id]);

  const navigateToPlay = (targetCollId: number) => {
    const orders = buildPlayOrdersFromPicker(playMode);
    const sousQ =
      targetCollId === collection.id && playSousCollectionId !== "" ? playSousCollectionId : undefined;
    route(
      `/play/${targetCollId}${buildPlaySessionQuery({
        orders,
        qtype: playQtype,
        infinite: playInfinite,
        userId: playOrdersRequireUserId(orders) ? myUserId : undefined,
        sousCollectionId: sousQ,
        includeReflexion: playMode.includeReflexion === true ? true : undefined,
        reflexionSharePercent:
          playMode.includeReflexion && playMode.reflexionSharePercent !== 25
            ? playMode.reflexionSharePercent
            : undefined,
        includeChildCollections:
          sousQ == null && playMode.includeChildCollections === true ? true : undefined,
        childCollectionsMix:
          sousQ == null &&
          playMode.includeChildCollections &&
          playMode.childCollectionsMix !== "melange"
            ? playMode.childCollectionsMix
            : undefined,
        familyQuotaPercent:
          sousQ == null &&
          playMode.includeChildCollections &&
          playMode.familyQuotaPercent !== 100
            ? playMode.familyQuotaPercent
            : undefined,
        familyQuotaMax:
          sousQ == null &&
          playMode.includeChildCollections &&
          playMode.familyQuotaMax > 0
            ? playMode.familyQuotaMax
            : undefined,
        includePersonnaliteFiches:
          sousQ == null && playMode.includePersonnaliteFiches === true ? true : undefined,
      })}`,
    );
  };

  const importanceButtons = [
    { value: "" as const, label: "Sans niveau" },
    { value: "pionnier" as const, label: "Pionnier" },
    { value: "important" as const, label: "Important" },
    { value: "secondaire" as const, label: "Secondaire" },
  ];

  return {
    data: {
      collection,
      linkedTags,
      counts,
      n,
      isMine,
      personnalitesSorted,
      sousChildren,
      sousForPlay,
      tagPickerPool,
      collectionBorderHex,
    },
    state: {
      playSousCollectionId,
      setPlaySousCollectionId,
      importPick,
      setImportPick,
    },
    hierarchy: {
      toggle: hierarchyViewToggle,
    },
    tags: {
      assignableTags,
      onAssignTag,
      onUnassignTag,
    },
    personnalites: {
      picker: persoPickable,
      onAssignPerso,
      onUnassignPerso,
      importanceButtons,
      assignBusyId: assignPersoBusyCollectionId,
    },
    busy: {
      assignTag: assignBusyCollectionId,
      deleteCollection: deleteBusyCollectionId,
    },
    actions: {
      onDeleteCollection,
      navigateToPlay,
      handleQuestionsClick,
      handleCardClick,
    },
    meta: {
      uiLocked,
    },
  };
}
