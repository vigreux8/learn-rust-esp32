import { useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import { ClipboardCopy, FileJson, Pencil, Trash2 } from "lucide-preact";
import {
  deleteQuestion,
  fetchCollections,
  fetchModules,
  fetchQuestions,
  importQuestionsJson,
  patchQuestion,
} from "../../lib/api";
import type { CollectionUi, QuizzModuleRow, QuizzQuestionRow } from "../../types/quizz";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { PageMain } from "../molecules/PageMain";
import { Button } from "../atomes/Button";
import { Card } from "../atomes/Card";
import { Badge } from "../atomes/Badge";

const LLM_PROMPT_BASE = `Tu produis un JSON STRICT (sans markdown, sans commentaires) pour l’app FlowLearn.

Structure racine :
- "user_id" (optionnel) : entier — si absent, le premier utilisateur en base est utilisé.
- "collections" (optionnel) : tableau de blocs { "nom": string, "questions": [...] }.
- "questions_sans_collection" (optionnel) : tableau de questions hors collection.

Chaque question :
- "question" : énoncé.
- "commentaire" : OBLIGATOIRE — une courte anecdote ou explication qui éclaire POURQUOI la bonne réponse est la bonne, sans recopier mot pour mot le libellé de cette réponse (le joueur ne doit pas voir la bonne réponse répétée ici).
- "reponses" : exactement 4 objets { "texte": string, "correcte": true | false } avec UNE SEULE "correcte": true.

Si "nom" d’une collection existe déjà pour cet utilisateur, les questions sont ajoutées à cette collection ; sinon une nouvelle collection est créée.

Exemple minimal :

{
  "user_id": 1,
  "collections": [
    {
      "nom": "Ma thématique",
      "questions": [
        {
          "question": "… ?",
          "commentaire": "Anecdote : …",
          "reponses": [
            { "texte": "Bonne", "correcte": true },
            { "texte": "Fausse A", "correcte": false },
            { "texte": "Fausse B", "correcte": false },
            { "texte": "Fausse C", "correcte": false }
          ]
        }
      ]
    }
  ],
  "questions_sans_collection": []
}`;

const LLM_QUESTION_COUNT_OPTIONS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50,
] as const;

/** Prompt court quand une collection est sélectionnée : le JSON ne contient que des questions. */
const LLM_PROMPT_COLLECTION = `Tu produis UN SEUL JSON valide (sans markdown, sans texte avant ou après).

L’application est déjà positionnée sur UNE collection précise : exporte uniquement une liste de questions. Elles seront toutes enregistrées dans cette collection — n’inclus aucun nom de collection, aucun tableau "collections", aucun "questions_sans_collection".

Racine :
- "user_id" (recommandé) : entier — le propriétaire de la collection (toi dans l’interface).
- "questions" : tableau non vide. Chaque élément :
  - "question" : string non vide.
  - "commentaire" : string — courte anecdote ou explication pédagogique ; n’y recopie pas mot pour mot le libellé de la bonne réponse.
  - "reponses" : exactement 4 objets { "texte": string, "correcte": true | false } avec exactement une seule "correcte": true.

Exemple minimal :

{
  "user_id": 1,
  "questions": [
    {
      "question": "… ?",
      "commentaire": "…",
      "reponses": [
        { "texte": "Bonne réponse", "correcte": true },
        { "texte": "Fausse A", "correcte": false },
        { "texte": "Fausse B", "correcte": false },
        { "texte": "Fausse C", "correcte": false }
      ]
    }
  ]
}`;

export type QuestionsViewProps = {
  collectionId?: string;
};

function collectionFilterToQuery(s: string): number | "none" | undefined {
  if (s === "") return undefined;
  if (s === "none") return "none";
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function filterFromRouteParam(cid?: string): string {
  if (cid && /^\d+$/.test(cid)) return cid;
  return "";
}

export function QuestionsView({ collectionId }: QuestionsViewProps) {
  const [collections, setCollections] = useState<CollectionUi[]>([]);
  const [allModules, setAllModules] = useState<QuizzModuleRow[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<string>(() =>
    filterFromRouteParam(collectionId),
  );
  const [importTargetModuleId, setImportTargetModuleId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizzQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importDesiredQuestionCount, setImportDesiredQuestionCount] = useState(5);
  const [saving, setSaving] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const targetCollectionNumeric =
    collectionFilter !== "" &&
    collectionFilter !== "none" &&
    /^\d+$/.test(collectionFilter)
      ? Number(collectionFilter)
      : null;

  const llmPromptFull = useMemo(() => {
    const n = importDesiredQuestionCount;
    const countBlock =
      targetCollectionNumeric != null
        ? `\n\n— Quantité : le tableau racine "questions" doit contenir exactement ${n} objet(s)-question (ni plus ni moins).`
        : `\n\n— Quantité : le JSON doit représenter exactement ${n} question(s) au total (somme des questions dans tous les blocs "collections" et dans "questions_sans_collection").`;

    if (targetCollectionNumeric == null) {
      return LLM_PROMPT_BASE + countBlock;
    }
    const col = collections.find((c) => c.id === targetCollectionNumeric);
    const nom = col?.nom ?? `id ${targetCollectionNumeric}`;
    const mod =
      importTargetModuleId != null
        ? allModules.find((m) => m.id === importTargetModuleId)
        : undefined;
    let tail = `\n\n— Collection active dans l’interface : « ${nom} » (id ${targetCollectionNumeric}).`;
    if (mod) {
      tail += `\n— Après import, lien vers la supercollection « ${mod.nom} » (id ${mod.id}) si tu l’as sélectionnée ci-dessus.`;
    }
    return LLM_PROMPT_COLLECTION + countBlock + tail;
  }, [
    targetCollectionNumeric,
    collections,
    importTargetModuleId,
    allModules,
    importDesiredQuestionCount,
  ]);

  useEffect(() => {
    setCollectionFilter(filterFromRouteParam(collectionId));
  }, [collectionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = new URLSearchParams(window.location.search).get("module");
    if (m && /^\d+$/.test(m)) setImportTargetModuleId(Number(m));
    else setImportTargetModuleId(null);
  }, [collectionId]);

  const reload = () => {
    setLoading(true);
    setLoadError(null);
    const fp = collectionFilterToQuery(collectionFilter);
    fetchQuestions(fp)
      .then(setQuestions)
      .catch(() => setLoadError("fetch"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch(() => {
        /* liste filtres optionnelle */
      });
    fetchModules()
      .then(setAllModules)
      .catch(() => {
        /* optionnel */
      });
  }, []);

  useEffect(() => {
    reload();
  }, [collectionFilter]);

  const onCollectionFilterChange = (value: string) => {
    setCollectionFilter(value);
    if (value === "" || value === "none") {
      route("/questions");
      return;
    }
    if (/^\d+$/.test(value)) {
      const modQ =
        importTargetModuleId != null ? `?module=${importTargetModuleId}` : "";
      route(`/questions/${value}${modQ}`);
    }
  };

  const startEdit = (q: QuizzQuestionRow) => {
    setEditingId(q.id);
    setDraft(q.question);
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      const updated = await patchQuestion(editingId, { question: draft });
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? updated : q)));
      setEditingId(null);
    } catch {
      setLoadError("save");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const remove = async (id: number) => {
    setSaving(true);
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (editingId === id) setEditingId(null);
    } catch {
      setLoadError("delete");
    } finally {
      setSaving(false);
    }
  };

  const copyLlmPrompt = async () => {
    try {
      await navigator.clipboard.writeText(llmPromptFull);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      setImportMessage("Impossible de copier (permissions du navigateur).");
    }
  };

  const runImport = async () => {
    setImportBusy(true);
    setImportMessage(null);
    try {
      const data = JSON.parse(importText) as unknown;
      const cid = targetCollectionNumeric ?? undefined;
      const mid =
        cid != null && importTargetModuleId != null
          ? importTargetModuleId
          : undefined;
      const res = await importQuestionsJson(data, { collectionId: cid, moduleId: mid });
      const baseMsg = `Import réussi : ${res.createdQuestions} question(s) créée(s)`;
      const tail =
        cid != null
          ? " — ajoutées à la collection affichée."
          : res.createdCollections > 0
            ? `, ${res.createdCollections} nouvelle(s) collection(s).`
            : ".";
      setImportMessage(baseMsg + tail);
      setImportText("");
      reload();
      fetchCollections().then(setCollections).catch(() => {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "JSON ou réseau invalide.";
      setImportMessage(msg);
    } finally {
      setImportBusy(false);
    }
  };

  return (
    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <PageMain>
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">Questions</h1>
            <p class="mt-1 text-sm text-base-content/60">
              Modifier ou supprimer via l’API backend (Prisma / SQLite).
            </p>
          </div>
          <Button
            variant="learn"
            class="gap-2 self-start sm:self-auto"
            onClick={() => {
              setImportOpen((o) => !o);
              setImportMessage(null);
            }}
          >
            <FileJson class="h-4 w-4" aria-hidden />
            Import LLM
          </Button>
        </div>

        {loadError ? (
          <div class="mb-6 rounded-[var(--radius-box)] border border-error/20 bg-error/5 px-4 py-3 text-sm text-base-content">
            Une opération a échoué.{" "}
            <button type="button" class="link link-primary" onClick={() => setLoadError(null)}>
              Fermer
            </button>
          </div>
        ) : null}

        {importOpen ? (
          <Card class="fl-reveal-enter mb-6 border-learn/15 bg-learn/[0.06]">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-stretch">
              <aside class="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-base-content/10 bg-base-100/60 p-3 lg:w-44 lg:max-w-44">
                <p class="text-[0.65rem] font-semibold uppercase tracking-wide text-base-content/45">
                  Options
                </p>
                <div>
                  <label
                    class="mb-1 block text-xs font-medium text-base-content/70"
                    for="import-llm-question-count"
                  >
                    Nombre de questions
                  </label>
                  <select
                    id="import-llm-question-count"
                    class="select select-bordered select-sm w-full rounded-lg border-base-content/15 bg-base-100 text-sm"
                    value={String(importDesiredQuestionCount)}
                    onChange={(e) => {
                      const v = Number((e.target as HTMLSelectElement).value);
                      if (Number.isFinite(v)) setImportDesiredQuestionCount(v);
                    }}
                  >
                    {LLM_QUESTION_COUNT_OPTIONS.map((k) => (
                      <option key={k} value={String(k)}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <p class="mt-2 text-[0.65rem] leading-snug text-base-content/50">
                    Inclus dans le prompt copié pour le LLM.
                  </p>
                </div>
              </aside>
              <div class="min-w-0 flex-1">
                <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p class="text-sm font-medium text-base-content">Prompt à copier pour ton LLM</p>
                  <Button variant="outline" class="btn-sm gap-1" type="button" onClick={copyLlmPrompt}>
                    <ClipboardCopy class="h-3.5 w-3.5" aria-hidden />
                    {promptCopied ? "Copié" : "Copier"}
                  </Button>
                </div>
                <textarea
                  class="textarea textarea-bordered mb-3 w-full min-h-28 rounded-2xl border-base-content/15 bg-base-100/80 text-sm transition duration-300"
                  readOnly
                  value={llmPromptFull}
                />
                <p class="mb-2 text-xs text-base-content/55">
                  {targetCollectionNumeric != null ? (
                    <>
                      Colle le JSON au format <code class="text-xs">questions</code> uniquement : chaque entrée sera
                      liée à la collection affichée (aucun autre format requis).
                    </>
                  ) : (
                    <>
                      Colle le JSON généré ci-dessous (champs <code class="text-xs">collections</code> et/ou{" "}
                      <code class="text-xs">questions_sans_collection</code>, ou tableau racine{" "}
                      <code class="text-xs">questions</code>).
                    </>
                  )}
                </p>
                <textarea
                  class="textarea textarea-bordered mb-3 w-full min-h-32 rounded-2xl border-dashed border-learn/35 bg-base-100/60 font-mono text-xs leading-relaxed"
                  placeholder={
                    targetCollectionNumeric != null
                      ? '{ "user_id": 1, "questions": [ { "question": "…", "commentaire": "…", "reponses": [ ... ] } ] }'
                      : '{ "collections": [ ... ], "questions_sans_collection": [] }'
                  }
                  value={importText}
                  onInput={(e) => setImportText((e.target as HTMLTextAreaElement).value)}
                />
                {importMessage ? (
                  <p class="mb-3 text-sm text-base-content/80">{importMessage}</p>
                ) : null}
                <Button variant="flow" disabled={importBusy || !importText.trim()} onClick={runImport}>
                  {importBusy ? "Import…" : "Importer en base"}
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {targetCollectionNumeric != null ? (
          <div class="mb-4 rounded-xl border border-flow/20 bg-flow/5 px-4 py-3 text-sm text-base-content/80">
            <p class="font-medium text-base-content">
              Collection cible :{" "}
              {collections.find((c) => c.id === targetCollectionNumeric)?.nom ?? `#${targetCollectionNumeric}`}
            </p>
            <p class="mt-2 text-xs text-base-content/60">
              L’import LLM ajoute les questions ici. Tu peux forcer un lien vers une supercollection après import :
            </p>
            <label class="mt-2 block text-xs font-medium text-base-content/55" for="import-module-link">
              Supercollection (optionnel)
            </label>
            <select
              id="import-module-link"
              class="select select-bordered select-sm mt-1 max-w-md rounded-xl border-base-content/15 bg-base-100"
              value={importTargetModuleId ?? ""}
              onChange={(e) => {
                const v = (e.target as HTMLSelectElement).value;
                setImportTargetModuleId(v === "" ? null : Number(v));
              }}
            >
              <option value="">(aucune — pas de lien forcé)</option>
              {allModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label class="text-sm font-medium text-base-content/80" for="q-collection-filter">
            Filtrer par collection
          </label>
          <select
            id="q-collection-filter"
            class="select select-bordered select-sm max-w-full rounded-xl border-base-content/15 bg-base-100 sm:max-w-xs"
            value={collectionFilter}
            onChange={(e) => onCollectionFilterChange((e.target as HTMLSelectElement).value)}
          >
            <option value="">Toutes les questions</option>
            <option value="none">Sans collection</option>
            {collections.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p class="text-sm text-base-content/60">Chargement…</p>
        ) : loadError === "fetch" ? (
          <Card class="border-base-content/15">
            <p class="mb-3 text-sm text-base-content/70">Impossible de charger les questions.</p>
            <Button variant="flow" class="btn-sm" onClick={reload}>
              Réessayer
            </Button>
          </Card>
        ) : (
          <Card>
            <p class="mb-4 text-sm text-base-content/60">
              {questions.length} question{questions.length !== 1 ? "s" : ""} affichée
              {questions.length !== 1 ? "s" : ""}.
            </p>
            <ul class="space-y-3">
              {questions.map((q) => (
                <li
                  key={q.id}
                  class="overflow-hidden rounded-[1.35rem] border border-base-content/10 bg-base-200/35 transition duration-300 hover:border-flow/20 hover:shadow-md hover:shadow-flow/5"
                >
                  <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0 flex-1">
                      <div class="mb-2 flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">id {q.id}</Badge>
                        {q.collections.length === 0 ? (
                          <Badge tone="learn">Sans collection</Badge>
                        ) : (
                          q.collections.map((c) => (
                            <Badge key={c.id} tone="flow">
                              {c.nom}
                            </Badge>
                          ))
                        )}
                      </div>
                      {q.commentaire.trim() ? (
                        <p class="mb-2 text-xs leading-relaxed text-base-content/55 line-clamp-3">
                          {q.commentaire}
                        </p>
                      ) : null}
                      {editingId === q.id ? (
                        <textarea
                          class="textarea textarea-bordered w-full rounded-2xl border-base-content/15 text-sm transition duration-300"
                          value={draft}
                          onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
                          rows={3}
                        />
                      ) : (
                        <p class="text-sm font-medium leading-relaxed text-base-content">{q.question}</p>
                      )}
                    </div>
                    <div class="flex shrink-0 flex-wrap gap-2">
                      {editingId === q.id ? (
                        <>
                          <Button variant="flow" class="btn-sm" onClick={saveEdit} disabled={saving}>
                            Enregistrer
                          </Button>
                          <Button variant="ghost" class="btn-sm" onClick={cancelEdit} disabled={saving}>
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" class="btn-sm gap-1" onClick={() => startEdit(q)} disabled={saving}>
                            <Pencil class="h-3.5 w-3.5" aria-hidden />
                            Modifier
                          </Button>
                          <Button variant="learn" class="btn-sm gap-1" onClick={() => remove(q.id)} disabled={saving}>
                            <Trash2 class="h-3.5 w-3.5" aria-hidden />
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </PageMain>
      <AppFooter />
    </div>
  );
}
