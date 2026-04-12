import { ChevronRight, FolderTree, ListTree, X } from "lucide-preact";
import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { buildPlaySessionQuery, type PlayOrder, type PlayQtype } from "../../lib/playOrder";
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
  onUnassign: (collectionId: number, moduleId: number) => void | Promise<void>;
};

export function CollectionCard({
  collection,
  myUserId,
  allModules,
  assignBusyCollectionId,
  onAssign,
  onUnassign,
}: CollectionCardProps) {
  const n = collection.questions.length;
  const counts = collection.question_counts_by_type;
  const isMine = collection.user_id === myUserId;
  const [selectedModuleId, setSelectedModuleId] = useState<number | "">("");
  const [playOrder, setPlayOrder] = useState<PlayOrder>("random");
  const [playQtype, setPlayQtype] = useState<PlayQtype>("melanger");
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
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone="flow">{n} question{n > 1 ? "s" : ""}</Badge>
            <Badge tone="learn" class="font-normal opacity-90">
              Histoire {counts.histoire}
            </Badge>
            <Badge tone="flow" class="border border-flow/25 bg-flow/10 font-normal opacity-95">
              Pratique {counts.pratique}
            </Badge>
          </div>
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
                <span
                  key={m.id}
                  class="inline-flex max-w-full items-center gap-0.5 rounded-full border border-learn/30 bg-learn/10 pl-2.5 pr-0.5 text-xs font-medium text-learn"
                >
                  <span class="truncate py-1">{m.nom}</span>
                  {isMine ? (
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs min-h-0 h-7 w-7 shrink-0 rounded-full p-0 text-base-content/60 hover:bg-error/15 hover:text-error"
                      title={`Retirer « ${m.nom} »`}
                      aria-label={`Retirer la supercollection ${m.nom}`}
                      disabled={assignBusyCollectionId !== null}
                      onClick={() => void onUnassign(collection.id, m.id)}
                    >
                      <X class="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                </span>
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
        <div class="flex shrink-0 flex-col gap-2 self-start sm:self-center sm:items-end">
          <label class="w-full text-xs font-medium text-base-content/55 sm:text-end" for={`play-order-${collection.id}`}>
            Ordre des questions
          </label>
          <select
            id={`play-order-${collection.id}`}
            class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 sm:max-w-[11rem]"
            value={playOrder}
            onChange={(e) => {
              const v = (e.target as HTMLSelectElement).value;
              setPlayOrder(v === "linear" ? "linear" : "random");
            }}
          >
            <option value="random">Aléatoire</option>
            <option value="linear">Linéaire</option>
          </select>
          <label class="w-full text-xs font-medium text-base-content/55 sm:text-end" for={`play-qtype-${collection.id}`}>
            Type de questions
          </label>
          <select
            id={`play-qtype-${collection.id}`}
            class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 sm:max-w-[11rem]"
            value={playQtype}
            onChange={(e) => {
              const v = (e.target as HTMLSelectElement).value;
              if (v === "histoire" || v === "pratique" || v === "melanger") setPlayQtype(v);
            }}
          >
            <option value="melanger">Mélanger</option>
            <option value="histoire">Histoire</option>
            <option value="pratique">Pratique</option>
          </select>
          <Button
            variant="outline"
            class="btn-sm gap-1"
            onClick={() => {
              const first = linkedModules[0];
              const q = first != null ? `?module=${first.id}` : "";
              route(`/questions/${collection.id}${q}`);
            }}
          >
            <ListTree class="h-4 w-4" aria-hidden />
            Questions
          </Button>
          <Button
            variant="flow"
            class="btn-sm gap-1"
            onClick={() =>
              route(`/play/${collection.id}${buildPlaySessionQuery({ order: playOrder, qtype: playQtype })}`)
            }
          >
            Jouer
            <ChevronRight class="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Button>
        </div>
      </div>
    </Card>
  );
}
