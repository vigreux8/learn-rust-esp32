import { useEffect, useState } from "preact/hooks";
import {
  fetchRefCategories,
  fetchRefCategoriesHierarchy,
  fetchRefQuestionDifficulte,
  fetchRefQuestionImportance,
} from "../../../../../../lib/api";
import type {
  RefCategorieHierarchyRow,
  RefCategorieRow,
  RefQuestionScaleRow,
} from "../../../../../../types/quizz";
import {
  sortRefDifficulteForQuizSession,
  sortRefImportanceForQuizSession,
} from "../../QuizSessionView.metier";

/**
 * Référentiels nécessaires au quiz (catégories, hiérarchie, échelles importance / difficulté), chargés une fois
 * et triés pour l’UI session.
 */
export function useQuizSessionBootstrapRefs(): {
  refCategories: RefCategorieRow[];
  refCategoriesHierarchy: RefCategorieHierarchyRow[];
  refImportanceQuestion: RefQuestionScaleRow[];
  refDifficulteQuestion: RefQuestionScaleRow[];
} {
  const [refCategories, setRefCategories] = useState<RefCategorieRow[]>([]);
  const [refCategoriesHierarchy, setRefCategoriesHierarchy] = useState<RefCategorieHierarchyRow[]>(
    [],
  );
  const [refImportanceQuestion, setRefImportanceQuestion] = useState<RefQuestionScaleRow[]>([]);
  const [refDifficulteQuestion, setRefDifficulteQuestion] = useState<RefQuestionScaleRow[]>([]);

  useEffect(() => {
    void fetchRefCategories()
      .then(setRefCategories)
      .catch(() => setRefCategories([]));
    void fetchRefCategoriesHierarchy()
      .then(setRefCategoriesHierarchy)
      .catch(() => setRefCategoriesHierarchy([]));
    void fetchRefQuestionImportance()
      .then((rows) => setRefImportanceQuestion(sortRefImportanceForQuizSession(rows)))
      .catch(() => setRefImportanceQuestion([]));
    void fetchRefQuestionDifficulte()
      .then((rows) => setRefDifficulteQuestion(sortRefDifficulteForQuizSession(rows)))
      .catch(() => setRefDifficulteQuestion([]));
  }, []);

  return {
    refCategories,
    refCategoriesHierarchy,
    refImportanceQuestion,
    refDifficulteQuestion,
  };
}
