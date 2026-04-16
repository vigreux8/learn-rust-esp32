import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import { FileJson } from "lucide-preact";
import {
  deleteQuestion,
  fetchCollections,
  fetchModules,
  fetchQuestionDetail,
  fetchQuestions,
  fetchRefCategories,
  importQuestionsJson,
  patchQuestion,
} from "../../lib/api";
import type {
  CollectionUi,
  QuizzModuleRow,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieRow,
} from "../../types/quizz";
import {
  formatExistingQuestionStemsForPrompt,
  LLM_PROMPT_BASE,
  LLM_PROMPT_COLLECTION,
} from "../../lib/llmImportPrompts";
import { QUESTION_CATEGORIE_DEFINITIONS } from "../../lib/questionCategories";
import type { PlayQtype } from "../../lib/playOrder";
import { QuestionsCollectionContextBar } from "./QuestionsCollectionContextBar";
import { QuestionsLlmImportPanel } from "./QuestionsLlmImportPanel";
import { QuestionsTable } from "./QuestionsTable";
import { QuestionEditModal } from "../molecules/QuestionEditModal";
import { AppHeader } from "../molecules/AppHeader";
import { AppFooter } from "../molecules/AppFooter";
import { PageMain } from "../molecules/PageMain";
import { Button } from "../atomes/Button";
import { Card } from "../atomes/Card";

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
  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editDetail, setEditDetail] = useState<QuizzQuestionDetail | null>(null);
  const [editDraftQuestion, setEditDraftQuestion] = useState("");
  const [editDraftCommentaire, setEditDraftCommentaire] = useState("");
  const [editDraftCategorieId, setEditDraftCategorieId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importDesiredQuestionCount, setImportDesiredQuestionCount] = useState(5);
  /** Nom de collection injecté dans le prompt (prérempli depuis la collection affichée). */
  const [importLlmCollectionName, setImportLlmCollectionName] = useState("");
  const [importLlmSubject, setImportLlmSubject] = useState("");
  const [importLlmIncludeExistingStems, setImportLlmIncludeExistingStems] = useState(false);
  /** `ref_categorie.id` — même source que la modal « Modifier la question ». */
  const [importLlmCategorieId, setImportLlmCategorieId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const importLlmLastSyncedCollectionId = useRef<number | null>(null);
  /** Filtre d’affichage du tableau (sans nouvel appel API). */
  const [listFilterQtype, setListFilterQtype] = useState<PlayQtype>("melanger");

  const targetCollectionNumeric =
    collectionFilter !== "" &&
    collectionFilter !== "none" &&
    /^\d+$/.test(collectionFilter)
      ? Number(collectionFilter)
      : null;

  const questionsForTable = useMemo(() => {
    if (listFilterQtype === "melanger") return questions;
    return questions.filter((q) => q.categorie_type === listFilterQtype);
  }, [questions, listFilterQtype]);

  useEffect(() => {
    if (targetCollectionNumeric == null) {
      importLlmLastSyncedCollectionId.current = null;
      setImportLlmCollectionName("");
      setImportLlmIncludeExistingStems(false);
      return;
    }
    const col = collections.find((c) => c.id === targetCollectionNumeric);
    const switched = importLlmLastSyncedCollectionId.current !== targetCollectionNumeric;
    if (switched) {
      importLlmLastSyncedCollectionId.current = targetCollectionNumeric;
      setImportLlmCollectionName(col?.nom ?? "");
      return;
    }
    if (col?.nom) {
      setImportLlmCollectionName((prev) => (prev.trim() === "" ? col.nom : prev));
    }
  }, [targetCollectionNumeric, collections]);

  useEffect(() => {
    if (refCategories.length === 0) return;
    setImportLlmCategorieId((prev) => {
      if (prev != null && refCategories.some((c) => c.id === prev)) return prev;
      return refCategories.find((c) => c.type === "histoire")?.id ?? refCategories[0]!.id;
    });
  }, [refCategories]);

  const llmPromptFull = useMemo(() => {
    const n = importDesiredQuestionCount;
    const countBlock =
      targetCollectionNumeric != null
        ? `\n\n— Quantité : le tableau racine "questions" doit contenir exactement ${n} objet(s)-question (ni plus ni moins).`
        : `\n\n— Quantité : le JSON doit représenter exactement ${n} question(s) au total (somme des questions dans tous les blocs "collections" et dans "questions_sans_collection").`;

    const nameTrim = importLlmCollectionName.trim();
    const nameBlock =
      nameTrim.length > 0
        ? targetCollectionNumeric != null
          ? `\n\n— Nom de la collection (thème / cohérence) : « ${nameTrim} ». Le JSON ne doit pas dupliquer ce nom dans un champ "collections" : seulement le tableau "questions".`
          : `\n\n— Nom de la collection cible dans le JSON : utilise exactement « ${nameTrim} » comme "nom" dans le bloc "collections" concerné (ou fusionne avec une collection existante de ce nom pour cet utilisateur).`
        : "";

    const subjectTrim = importLlmSubject.trim();
    const subjectBlock =
      subjectTrim.length > 0
        ? `\n\n— Sujet / thème des nouvelles questions à rédiger :\n${subjectTrim}`
        : "";

    const selectedCat = refCategories.find((c) => c.id === importLlmCategorieId);
    const catKey =
      selectedCat?.type === "histoire" || selectedCat?.type === "pratique"
        ? selectedCat.type
        : "histoire";
    const categorieBlock = `\n\n— Catégorie enregistrée pour chaque question importée (ref_categorie) : « ${catKey} » — ${QUESTION_CATEGORIE_DEFINITIONS[catKey]}`;

    const questionsStemsSameCategorie =
      importLlmCategorieId == null
        ? []
        : questions.filter((q) => q.categorie_id === importLlmCategorieId);
    const existingBlock =
      importLlmIncludeExistingStems &&
      targetCollectionNumeric != null &&
      questionsStemsSameCategorie.length > 0
        ? `\n\n— Questions déjà présentes dans cette collection pour la catégorie « ${catKey} » uniquement (intitulés seuls, sans réponses) — évite les doublons et les paraphrases trop proches :\n${formatExistingQuestionStemsForPrompt(questionsStemsSameCategorie)}`
        : "";

    if (targetCollectionNumeric == null) {
      return LLM_PROMPT_BASE + countBlock + nameBlock + subjectBlock + categorieBlock;
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
    return (
      LLM_PROMPT_COLLECTION +
      countBlock +
      nameBlock +
      subjectBlock +
      categorieBlock +
      existingBlock +
      tail
    );
  }, [
    targetCollectionNumeric,
    collections,
    importTargetModuleId,
    allModules,
    importDesiredQuestionCount,
    importLlmCollectionName,
    importLlmSubject,
    importLlmIncludeExistingStems,
    importLlmCategorieId,
    refCategories,
    questions,
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
    fetchRefCategories()
      .then(setRefCategories)
      .catch(() => {
        /* catégories optionnelles pour la modal */
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

  const openEditModal = (q: QuizzQuestionRow) => {
    setEditModalOpen(true);
    setEditModalLoading(true);
    setEditModalError(null);
    setEditDetail(null);
    void fetchQuestionDetail(q.id)
      .then((d) => {
        setEditDetail(d);
        setEditDraftQuestion(d.question);
        setEditDraftCommentaire(d.commentaire);
        setEditDraftCategorieId(d.categorie_id);
      })
      .catch(() => setEditModalError("fetch"))
      .finally(() => setEditModalLoading(false));
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditModalLoading(false);
    setEditModalError(null);
    setEditDetail(null);
  };

  const refreshEditDetail = async () => {
    if (editDetail == null) return;
    try {
      const d = await fetchQuestionDetail(editDetail.id);
      setEditDetail(d);
    } catch {
      /* conserver le détail affiché */
    }
  };

  const saveEditModal = async () => {
    if (editDetail == null) return;
    setSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (editDraftQuestion !== editDetail.question) payload.question = editDraftQuestion;
      if (editDraftCommentaire !== editDetail.commentaire) {
        payload.commentaire = editDraftCommentaire;
      }
      if (editDraftCategorieId != null && editDraftCategorieId !== editDetail.categorie_id) {
        payload.categorie_id = editDraftCategorieId;
      }
      if (Object.keys(payload).length === 0) {
        closeEditModal();
        return;
      }
      const updated = await patchQuestion(editDetail.id, payload);
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      closeEditModal();
    } catch {
      setLoadError("save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setSaving(true);
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (editDetail?.id === id) closeEditModal();
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
      const row = refCategories.find((c) => c.id === importLlmCategorieId);
      const categorieApi =
        row?.type === "pratique" ? "pratique" : row?.type === "histoire" ? "histoire" : "histoire";
      const res = await importQuestionsJson(data, {
        collectionId: cid,
        moduleId: mid,
        categorie: categorieApi,
      });
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
          <QuestionsLlmImportPanel
            llmPromptFull={llmPromptFull}
            targetCollectionNumeric={targetCollectionNumeric}
            importDesiredQuestionCount={importDesiredQuestionCount}
            setImportDesiredQuestionCount={setImportDesiredQuestionCount}
            categorieOptions={refCategories}
            importLlmCategorieId={importLlmCategorieId}
            setImportLlmCategorieId={setImportLlmCategorieId}
            importLlmCollectionName={importLlmCollectionName}
            setImportLlmCollectionName={setImportLlmCollectionName}
            importLlmSubject={importLlmSubject}
            setImportLlmSubject={setImportLlmSubject}
            importLlmIncludeExistingStems={importLlmIncludeExistingStems}
            setImportLlmIncludeExistingStems={setImportLlmIncludeExistingStems}
            importText={importText}
            setImportText={setImportText}
            importMessage={importMessage}
            importBusy={importBusy}
            promptCopied={promptCopied}
            onCopyPrompt={() => void copyLlmPrompt()}
            onRunImport={() => void runImport()}
          />
        ) : null}

        <QuestionsCollectionContextBar
          targetCollectionNumeric={targetCollectionNumeric}
          collections={collections}
          allModules={allModules}
          importTargetModuleId={importTargetModuleId}
          setImportTargetModuleId={setImportTargetModuleId}
        />

        <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div class="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-xs">
            <label class="text-sm font-medium text-base-content/80" for="q-collection-filter">
              Filtrer par collection
            </label>
            <select
              id="q-collection-filter"
              class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100"
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
          <div class="flex min-w-0 flex-col gap-2 sm:w-44">
            <label class="text-sm font-medium text-base-content/80" for="q-list-qtype-filter">
              Filtrer par type (affichage)
            </label>
            <select
              id="q-list-qtype-filter"
              class="select select-bordered select-sm w-full rounded-xl border-base-content/15 bg-base-100"
              value={listFilterQtype}
              onChange={(e) => {
                const v = (e.target as HTMLSelectElement).value;
                if (v === "histoire" || v === "pratique" || v === "melanger") setListFilterQtype(v);
              }}
            >
              <option value="melanger">Tout (histoire + pratique)</option>
              <option value="histoire">Histoire seulement</option>
              <option value="pratique">Pratique seulement</option>
            </select>
          </div>
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
          <QuestionsTable
            questions={questionsForTable}
            saving={saving}
            onEdit={openEditModal}
            onRemove={remove}
          />
        )}
        <QuestionEditModal
          open={editModalOpen}
          loading={editModalLoading}
          loadError={editModalError}
          detail={editDetail}
          categorieOptions={refCategories}
          draftQuestion={editDraftQuestion}
          draftCommentaire={editDraftCommentaire}
          draftCategorieId={editDraftCategorieId}
          saving={saving}
          onClose={closeEditModal}
          onDraftQuestion={setEditDraftQuestion}
          onDraftCommentaire={setEditDraftCommentaire}
          onDraftCategorieId={setEditDraftCategorieId}
          onSave={() => void saveEditModal()}
          onReponseUpdated={() => void refreshEditDetail()}
        />
      </PageMain>
      <AppFooter />
    </div>
  );
}
