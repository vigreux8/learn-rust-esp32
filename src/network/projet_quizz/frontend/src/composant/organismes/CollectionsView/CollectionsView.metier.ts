import type { CollectionUi } from "../../../types/quizz";
import type { CollectionFilter, PendingDelete } from "./CollectionsView.types";

export function pendingDeleteLabels(pending: PendingDelete): { title: string; message: string } | null {
  if (pending == null) return null;
  if (pending.kind === "collection") {
    const c = pending.data;
    const total = c.questions.length;
    return {
      title: `Supprimer la collection « ${c.nom} » ?`,
      message:
        `Cette action est definitive :\n` +
        `· la collection et ses liens vers les supercollections seront supprimes ;\n` +
        `· les ${total} question${total > 1 ? "s" : ""} qui ne sont liees qu a cette collection seront supprimees (reponses et scores inclus) ;\n` +
        `· une question encore presente dans une autre collection sera seulement detachee de celle-ci.`,
    };
  }
  const m = pending.data;
  return {
    title: `Supprimer la supercollection « ${m.nom} » ?`,
    message: "Les liens avec les collections seront retires. Les collections elles-memes ne sont pas supprimees.",
  };
}

export function filterCollections(list: CollectionUi[], filter: CollectionFilter, myUserId: number): CollectionUi[] {
  if (filter === "all") return list;
  if (filter === "mine") return list.filter((c) => c.user_id === myUserId);
  if (filter.startsWith("user-")) {
    const uid = Number(filter.slice(5));
    if (Number.isFinite(uid)) return list.filter((c) => c.user_id === uid);
  }
  return list;
}

export function applyModuleFilter(list: CollectionUi[], moduleFilter: number | "all"): CollectionUi[] {
  if (moduleFilter === "all") return list;
  return list.filter((c) => (c.modules ?? []).some((m) => m.id === moduleFilter));
}
