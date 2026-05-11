import { Fragment } from "preact";
import type { JSX } from "preact";
import { route } from "preact-router";
import { ChevronRight, LayoutGrid, ListOrdered, ListTree, Tag, Trash2, X } from "lucide-preact";

import { personnaliteStripBorderHex } from "../../../../lib/collectionHierarchyVis";

import { Card } from "../../atomes/Card";
import { Badge } from "../../atomes/Badge";
import { Button } from "../../atomes/Button";
import { SearchAssociateBlock } from "./parts/SearchAssociateBlock";

import {
  buildQuestionsRoutePath,
  buildReflexionRoutePath,
  buildSousCollectionsRoutePath,
} from "./CollectionCard.metier";
import { COLLECTION_CARD_STYLES } from "./CollectionCard.styles";
import { useCollectionCard } from "./CollectionCard.hook";
import type { CollectionCardProps } from "./CollectionCard.types";

export function CollectionCard(props: CollectionCardProps) {
  const vm = useCollectionCard(props);
  const { data, state, hierarchy, tags, personnalites, busy, actions, meta } = vm;

  return (
    <Fragment>
      {data.personnalitesSorted.length > 0 ? (
        <div class="mb-2 flex flex-col gap-2">
          {data.personnalitesSorted.map((p) => {
            const detachPerso = personnalites.onUnassignPerso;
            return (
            <div
              key={p.id}
              class="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 bg-base-100/95 px-3 py-2 shadow-sm"
              style={{ borderColor: personnaliteStripBorderHex(p.importance_type) }}
            >
              <button
                type="button"
                class="min-w-0 flex-1 rounded-lg text-left transition hover:bg-base-200/50 sm:pr-2"
                disabled={meta.uiLocked}
                aria-label={`Ouvrir la collection de ${p.prenom} ${p.nom}`}
                onClick={() => route(buildQuestionsRoutePath(p.fiche_collection_id, []))}
              >
                <p class="text-[11px] font-medium uppercase tracking-wide text-base-content/45">Personnalité</p>
                <p class="text-sm font-semibold text-base-content">
                  {p.prenom} {p.nom}
                  {p.importance_type ? (
                    <span class="ml-2 text-xs font-normal text-base-content/55">· {p.importance_type}</span>
                  ) : null}
                </p>
                <p class="mt-0.5 text-[10px] text-base-content/45">Collection liée · cliquer pour les questions</p>
              </button>
              <div class="flex shrink-0 items-center gap-1">
                <Button
                  variant="flow"
                  class="btn-xs gap-0.5"
                  disabled={meta.uiLocked}
                  onClick={() => actions.navigateToPlay(p.fiche_collection_id)}
                >
                  Jouer
                  <ChevronRight class="h-3.5 w-3.5" aria-hidden />
                </Button>
                {data.isMine && p.detachable === true && detachPerso != null ? (
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs shrink-0 text-error hover:bg-error/10"
                    title="Dissocier"
                    aria-label={`Dissocier ${p.prenom} ${p.nom}`}
                    disabled={meta.uiLocked}
                    onClick={() => void detachPerso(data.collection.id, p.id)}
                  >
                    <X class="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
            );
          })}
        </div>
      ) : null}
      <Card
        class={COLLECTION_CARD_STYLES.root}
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: data.collectionBorderHex,
        }}
        onClick={actions.handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event: JSX.TargetedKeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            actions.handleQuestionsClick();
          }
        }}
      >
        <div class={COLLECTION_CARD_STYLES.headerLayout}>
          <div class="space-y-2">
            {hierarchy.toggle ? (
              <label class="flex cursor-pointer items-center gap-2 rounded-xl border border-base-content/10 bg-base-100/60 px-2 py-1.5 text-xs text-base-content/80">
                <input
                  type="checkbox"
                  class="checkbox checkbox-xs checkbox-primary"
                  checked={hierarchy.toggle.checked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => hierarchy.toggle!.onChange((e.target as HTMLInputElement).checked)}
                />
                <span>Afficher uniquement les sous-collections de cette branche</span>
              </label>
            ) : null}
            <div class="flex flex-wrap items-center gap-2">
              <Badge tone="flow">
                {data.n} question{data.n > 1 ? "s" : ""}
              </Badge>
              <Badge tone="learn" class="font-normal opacity-90">
                Histoire {data.counts.histoire}
              </Badge>
              <Badge tone="flow" class="border border-flow/25 bg-flow/10 font-normal opacity-95">
                Pratique {data.counts.pratique}
              </Badge>
              <Badge tone="neutral" class="font-normal opacity-90">
                Connaissance {data.counts.connaissance}
              </Badge>
            </div>
            <h2 class="text-xl font-semibold tracking-tight text-base-content">{data.collection.nom}</h2>
            <p class="text-sm text-base-content/60">Collection · mise à jour {data.collection.update_at.slice(0, 10)}</p>
            <p class="text-sm text-base-content/60">Créé par {data.collection.createur_pseudot}</p>
            {data.linkedTags.length > 0 ? (
              <div class="flex flex-wrap items-center gap-2 pt-1">
                <span class="inline-flex items-center gap-1 text-xs font-medium text-base-content/50">
                  <Tag class="h-3.5 w-3.5" aria-hidden />Étiquettes
                </span>
                {data.linkedTags.map((m) => (
                  <span
                    key={m.id}
                    class="inline-flex max-w-full items-center gap-0.5 rounded-full border border-learn/30 bg-learn/10 pl-2.5 pr-0.5 text-xs font-medium text-learn"
                  >
                    <span class="truncate py-1">{m.nom}</span>
                    {data.isMine ? (
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs min-h-0 h-7 w-7 shrink-0 rounded-full p-0 text-base-content/60 hover:bg-error/15 hover:text-error"
                        title={`Retirer « ${m.nom} »`}
                        aria-label={`Retirer l’étiquette ${m.nom}`}
                        disabled={meta.uiLocked}
                        onClick={() => void tags.onUnassignTag(data.collection.id, m.id)}
                      >
                        <X class="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}
            {data.sousChildren.length > 0 ? (
              <div
                class="flex flex-col gap-2 border-t border-base-content/10 pt-3 sm:max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <label class="text-xs font-medium text-base-content/55" for={`sous-coll-pick-${data.collection.id}`}>
                  Sous-collection
                </label>
                <select
                  id={`sous-coll-pick-${data.collection.id}`}
                  key={`sous-coll-nav-${data.collection.id}`}
                  class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 sm:min-w-56"
                  defaultValue=""
                  disabled={meta.uiLocked}
                  onChange={(e) => {
                    const el = e.target as HTMLSelectElement;
                    const v = el.value;
                    el.value = "";
                    if (v) route(buildQuestionsRoutePath(Number(v), []));
                  }}
                >
                  <option value="">Sélectionner une sous-collection…</option>
                  {data.sousChildren.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {data.isMine && tags.assignableTags.length > 0 ? (
              <SearchAssociateBlock
                settings={{
                  resetKey: data.collection.id,
                  title: "Associer une collection comme étiquette",
                  placeholder: "Rechercher par nom…",
                  inputId: `tag-search-${data.collection.id}`,
                  associateLabel: busy.assignTag === data.collection.id ? "…" : "Associer",
                }}
                data={{ candidates: tags.assignableTags }}
                meta={{
                  getId: (row) => row.id,
                  getSuggestionLabel: (row) => row.nom,
                  matchesQuery: (row, q) => row.nom.toLowerCase().includes(q.trim().toLowerCase()),
                }}
                status={{
                  busy: busy.assignTag === data.collection.id,
                  interactionLocked: meta.uiLocked,
                }}
                actions={{
                  onAssociate: (tagCollectionId) => void tags.onAssignTag(data.collection.id, tagCollectionId),
                }}
              />
            ) : null}
            {data.isMine && tags.assignableTags.length === 0 ? (
              <p class="border-t border-base-content/10 pt-3 text-xs text-base-content/50">
                {data.tagPickerPool.length <= 1
                  ? "Crée une autre collection pour pouvoir l’utiliser comme étiquette (hashtag)."
                  : "Toutes les autres collections disponibles sont déjà liées comme étiquettes."}
              </p>
            ) : null}
            {data.isMine && personnalites.picker.length > 0
              ? (() => {
                  const assignPerso = personnalites.onAssignPerso;
                  if (assignPerso == null) return null;
                  return (
                    <SearchAssociateBlock
                      settings={{
                        resetKey: data.collection.id,
                        title: "Associer une personnalité",
                        placeholder: "Prénom, nom…",
                        inputId: `perso-search-${data.collection.id}`,
                        associateLabel: personnalites.assignBusyId === data.collection.id ? "…" : "Associer",
                      }}
                      data={{ candidates: personnalites.picker }}
                      meta={{
                        getId: (row) => row.id,
                        getSuggestionLabel: (row) => `${row.prenom} ${row.nom}`,
                        matchesQuery: (row, q) => {
                          const t = q.trim().toLowerCase();
                          const full = `${row.prenom} ${row.nom}`.toLowerCase();
                          return (
                            full.includes(t) ||
                            row.nom.toLowerCase().includes(t) ||
                            row.prenom.toLowerCase().includes(t)
                          );
                        },
                      }}
                      status={{
                        busy: personnalites.assignBusyId === data.collection.id,
                        interactionLocked: meta.uiLocked,
                      }}
                      actions={{
                        onAssociate: (personaliteId) =>
                          void assignPerso(data.collection.id, personaliteId, state.importPick),
                      }}
                      slots={{
                        betweenSelectionAndButton: (
                          <div class="flex flex-wrap gap-1">
                            <span class="w-full text-[10px] font-medium uppercase tracking-wide text-base-content/45">
                              Importance dans cette collection
                            </span>
                            {personnalites.importanceButtons.map((b) => (
                              <button
                                key={b.value === "" ? "none" : b.value}
                                type="button"
                                disabled={meta.uiLocked}
                                class={
                                  state.importPick === b.value
                                    ? "btn btn-primary btn-xs rounded-full px-3"
                                    : "btn btn-ghost btn-xs rounded-full border border-base-content/10 px-3"
                                }
                                onClick={() => state.setImportPick(b.value)}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        ),
                      }}
                    />
                  );
                })()
              : null}
          </div>
          <div class="flex shrink-0 flex-col gap-2 self-start sm:self-center sm:items-end">
            <Button variant="outline" class="btn-sm gap-1" onClick={actions.handleQuestionsClick}>
              <ListTree class="h-4 w-4" aria-hidden />
              Questions
            </Button>
            {data.isMine && data.n > 0 ? (
              <Button
                variant="outline"
                class="btn-sm gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  route(buildReflexionRoutePath(data.collection.id));
                }}
              >
                <ListOrdered class="h-4 w-4" aria-hidden />
                Suite logique
              </Button>
            ) : null}
            {data.isMine && data.n > 0 ? (
              <Button
                variant="outline"
                class="btn-sm gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  route(buildSousCollectionsRoutePath(data.collection.id));
                }}
              >
                <LayoutGrid class="h-4 w-4" aria-hidden />
                Sous-collections
              </Button>
            ) : null}
            {data.n > 0 && data.sousForPlay.length > 0 ? (
              <div
                class="w-full max-w-[16rem] space-y-1 rounded-xl border border-base-content/10 bg-base-100/80 px-2 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <label
                  class="block text-[10px] font-medium uppercase tracking-wide text-base-content/50"
                  for={`play-sous-${data.collection.id}`}
                >
                  Sous-collection
                </label>
                <select
                  id={`play-sous-${data.collection.id}`}
                  class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100 text-xs"
                  value={state.playSousCollectionId === "" ? "" : String(state.playSousCollectionId)}
                  disabled={meta.uiLocked}
                  onChange={(e) => {
                    const v = (e.target as HTMLSelectElement).value;
                    state.setPlaySousCollectionId(v === "" ? "" : Number(v));
                  }}
                >
                  <option value="">Toute la collection</option>
                  {data.sousForPlay.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <Button
              variant="flow"
              class="btn-sm gap-1"
              onClick={(e) => {
                e.stopPropagation();
                actions.navigateToPlay(data.collection.id);
              }}
            >
              Jouer
              <ChevronRight class="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </Button>
            {data.isMine && actions.onDeleteCollection != null ? (
              <button
                type="button"
                class="btn btn-outline btn-sm gap-1 border-error/40 text-error hover:bg-error/10"
                aria-label={`Supprimer la collection ${data.collection.nom}`}
                disabled={meta.uiLocked}
                onClick={() => actions.onDeleteCollection!(data.collection)}
              >
                {busy.deleteCollection === data.collection.id ? (
                  <span class="loading loading-spinner loading-xs" aria-hidden />
                ) : (
                  <Trash2 class="h-4 w-4" aria-hidden />
                )}
                Supprimer
              </button>
            ) : null}
          </div>
        </div>
      </Card>
    </Fragment>
  );
}
