import { useEffect, useMemo, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  deleteQuestion,
  fetchCollections,
  fetchModules,
  fetchQuestionDetail,
  fetchQuestions,
  fetchRefCategories,
  patchQuestion,
} from "../../../lib/api";
import type { CollectionUi, QuizzModuleRow, QuizzQuestionDetail, QuizzQuestionRow, RefCategorieRow } from "../../../types/quizz";
import type { PlayQtype } from "../../../lib/playOrder";
import { QuestionsCollectionContextBar } from "../QuestionsCollectionContextBar/QuestionsCollectionContextBar";
import { QuestionsTable } from "../QuestionsTable/QuestionsTable";
import { QuestionsLlmImportCard } from "../QuestionsLlmImportCard/QuestionsLlmImportCard";
import { QuestionEditModal } from "../QuestionEditModal/QuestionEditModal";
import { AppHeader } from "../../molecules/AppHeader/AppHeader";
import { AppFooter } from "../../molecules/AppFooter/AppFooter";
import { PageMain } from "../../molecules/PageMain/PageMain";
import { Button } from "../../atomes/Button/Button";
import { Card } from "../../atomes/Card/Card";
import { QUESTIONS_VIEW_STYLES } from "./QuestionsView.styles";

export type QuestionsViewProps = { collectionId?: string };

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
  const [collectionFilter, setCollectionFilter] = useState<string>(() => filterFromRouteParam(collectionId));
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
  const [saving, setSaving] = useState(false);
  const [listFilterQtype, setListFilterQtype] = useState<PlayQtype>("melanger");

  const targetCollectionNumeric = collectionFilter !== "" && collectionFilter !== "none" && /^\d+$/.test(collectionFilter) ? Number(collectionFilter) : null;
  const questionsForTable = useMemo(() => (listFilterQtype === "melanger" ? questions : questions.filter((q) => q.categorie_type === listFilterQtype)), [questions, listFilterQtype]);

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
    fetchQuestions(fp).then(setQuestions).catch(() => setLoadError("fetch")).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollections().then(setCollections).catch(() => {});
    fetchModules().then(setAllModules).catch(() => {});
    fetchRefCategories().then(setRefCategories).catch(() => {});
  }, []);

  useEffect(() => {
    reload();
  }, [collectionFilter]);

  const onCollectionFilterChange = (value: string) => {
    setCollectionFilter(value);
    if (value === "" || value === "none") return void route("/questions");
    if (/^\d+$/.test(value)) {
      const modQ = importTargetModuleId != null ? `?module=${importTargetModuleId}` : "";
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
    } catch {}
  };

  const saveEditModal = async () => {
    if (editDetail == null) return;
    setSaving(true);
    try {
      const payload: { question?: string; commentaire?: string; categorie_id?: number } = {};
      if (editDraftQuestion !== editDetail.question) payload.question = editDraftQuestion;
      if (editDraftCommentaire !== editDetail.commentaire) payload.commentaire = editDraftCommentaire;
      if (editDraftCategorieId != null && editDraftCategorieId !== editDetail.categorie_id) payload.categorie_id = editDraftCategorieId;
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

  return (
    <div class={QUESTIONS_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain>
        <QuestionsLlmImportCard
          data={{
            targetCollectionNumeric,
            collections,
            allModules,
            importTargetModuleId,
            questions,
          }}
          actions={{
            onImportSuccess: () => {
              reload();
              fetchCollections().then(setCollections).catch(() => {});
            },
          }}
        />

        {loadError ? (
          <div class="mb-6 rounded-box border border-error/20 bg-error/5 px-4 py-3 text-sm text-base-content">
            Une operation a echoue.{" "}
            <button type="button" class="link link-primary" onClick={() => setLoadError(null)}>
              Fermer
            </button>
          </div>
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
          <p class="text-sm text-base-content/60">Chargement...</p>
        ) : loadError === "fetch" ? (
          <Card class="border-base-content/15">
            <p class="mb-3 text-sm text-base-content/70">Impossible de charger les questions.</p>
            <Button variant="flow" class="btn-sm" onClick={reload}>
              Reessayer
            </Button>
          </Card>
        ) : (
          <QuestionsTable questions={questionsForTable} saving={saving} onEdit={openEditModal} onRemove={remove} />
        )}

        <QuestionEditModal
          settings={{ open: editModalOpen, onClose: closeEditModal }}
          actions={{
            onSave: () => void saveEditModal(),
            onDraftQuestion: setEditDraftQuestion,
            onDraftCommentaire: setEditDraftCommentaire,
            onDraftCategorieId: setEditDraftCategorieId,
            onReponseUpdated: () => void refreshEditDetail(),
          }}
          status={{ loading: editModalLoading, saving, error: editModalError }}
          data={{ questionDetail: editDetail, categorieOptions: refCategories }}
          drafts={{
            question: editDraftQuestion,
            commentaire: editDraftCommentaire,
            categorieId: editDraftCategorieId,
          }}
        />
      </PageMain>
      <AppFooter />
    </div>
  );
}
