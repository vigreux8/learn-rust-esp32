import { ChevronRight, FolderTree } from "lucide-preact";
import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";
import { Button } from "../atomes/Button";
import type { CollectionUi, QuizzModuleRow } from "../../types/quizz";

export type CollectionCardProps = {
  collection: CollectionUi;
  myUserId: number;
  allModules: QuizzModuleRow[];
  assignBusyCollectionId: number | null;
  onAssign: (collectionId: number, moduleId: number) => void | Promise<void>;
};

export function CollectionCard({
  collection,
  myUserId,
  allModules,
  assignBusyCollectionId,
  onAssign,
}: CollectionCardProps) {
  const n = collection.questions.length;
  const isMine = collection.user_id === myUserId;
  const [selectedModuleId, setSelectedModuleId] = useState<number | "">("");
  const linkedModules = collection.modules ?? [];

  const assignable = allModules.filter(
    (m) => !linkedModules.some((l) => l.id === m.id),
  );
  const moduleLinkKey = linkedModules.map((m) => m.id).join(",");
  useEffect(() => {
    setSelectedModuleId("");
  }, [collection.id, moduleLinkKey]);

  return (
    <Card class="group transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-flow/15">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-2">
          <Badge tone="flow">{n} question{n > 1 ? "s" : ""}</Badge>
          <h2 class="text-xl font-semibold tracking-tight text-base-content">{collection.nom}</h2>
          <p class="text-sm text-base-content/60">Collection · mise à jour {collection.update_at.slice(0, 10)}</p>
          <p class="text-sm text-base-content/60">Créé par {collection.createur_pseudot}</p>
          {linkedModules.length > 0 ? (
            <div class="flex flex-wrap items-center gap-2 pt-1">
              <span class="inline-flex items-center gap-1 text-xs font-medium text-base-content/50">
                <FolderTree class="h-3.5 w-3.5" aria-hidden />
                Supercollections
              </span>
              {linkedModules.map((m) => (
                <Badge key={m.id} tone="learn">
                  {m.nom}
                </Badge>
              ))}
            </div>
          ) : null}
          {isMine && allModules.length > 0 ? (
            <div class="flex flex-col gap-2 border-t border-base-content/10 pt-3 sm:max-w-md">
              <p class="text-xs font-medium text-base-content/55">Rattacher à une supercollection</p>
              {assignable.length === 0 ? (
                <p class="text-xs text-base-content/50">Cette collection est déjà liée à toutes les supercollections.</p>
              ) : (
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 sm:min-w-[12rem]"
                    value={selectedModuleId === "" ? "" : String(selectedModuleId)}
                    disabled={assignBusyCollectionId !== null}
                    onChange={(e) => {
                      const v = (e.target as HTMLSelectElement).value;
                      setSelectedModuleId(v === "" ? "" : Number(v));
                    }}
                  >
                    <option value="">Choisir…</option>
                    {assignable.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="learn"
                    class="btn-sm shrink-0"
                    disabled={assignBusyCollectionId !== null || selectedModuleId === ""}
                    onClick={() => {
                      if (selectedModuleId === "") return;
                      void onAssign(collection.id, selectedModuleId);
                    }}
                  >
                    {assignBusyCollectionId === collection.id ? "…" : "Assigner"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
          {isMine && allModules.length === 0 ? (
            <p class="border-t border-base-content/10 pt-3 text-xs text-base-content/50">
              Crée d’abord une supercollection (bloc ci-dessus) pour pouvoir rattacher cette collection.
            </p>
          ) : null}
        </div>
        <Button
          variant="flow"
          class="btn-sm gap-1 self-start sm:self-center"
          onClick={() => route(`/play/${collection.id}`)}
        >
          Jouer
          <ChevronRight class="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </div>
    </Card>
  );
}
