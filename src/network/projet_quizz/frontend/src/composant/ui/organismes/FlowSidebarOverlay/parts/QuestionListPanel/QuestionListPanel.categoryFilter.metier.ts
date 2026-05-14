import {
  QUESTION_CATEGORIE_KEYS,
  formatQuestionCategorieEnfantLabel,
  formatQuestionCategorieParentLabel,
} from "../../../../../../lib/questionCategories";
import type { RefCategorieHierarchyRow } from "../../../../../../types/quizz";
import type { FlowSidebarQuestionRow } from "../../FlowSidebarOverlay.types";

export type SidebarCategoryParentChip = {
  id: number;
  label: string;
  title: string;
};

export type SidebarCategoryEnfantChip = {
  id: number;
  label: string;
  title: string;
};

function normType(value: string): string {
  return value.trim().toLowerCase();
}

function parentSortKey(type: string): number {
  const n = normType(type);
  const i = (QUESTION_CATEGORIE_KEYS as readonly string[]).indexOf(n);
  return i >= 0 ? i : 100;
}

/**
 * Parents issus de `GET /quizz/categories/hierarchy` (même source que la session quiz).
 */
export function buildSidebarParentChipsFromHierarchy(
  hierarchy: RefCategorieHierarchyRow[],
): SidebarCategoryParentChip[] {
  if (hierarchy.length === 0) return [];
  return [...hierarchy]
    .sort((a, b) => {
      const d = parentSortKey(a.type) - parentSortKey(b.type);
      return d !== 0 ? d : a.id - b.id;
    })
    .map((row) => {
      const label = formatQuestionCategorieParentLabel(row.type);
      return {
        id: row.id,
        label,
        title: `N’afficher que les questions « ${label} » (cliquer à nouveau pour tout réafficher)`,
      };
    });
}

/**
 * Fallback sans hiérarchie API : un parent par `categorie_id` observé dans le périmètre.
 */
export function buildSidebarParentChipsFromQuestions(
  questions: readonly FlowSidebarQuestionRow[],
): SidebarCategoryParentChip[] {
  const byId = new Map<number, string>();
  for (const q of questions) {
    byId.set(q.categorie_id, q.categorie_type);
  }
  return [...byId.entries()]
    .sort(([idA, tA], [idB, tB]) => {
      const d = parentSortKey(tA) - parentSortKey(tB);
      return d !== 0 ? d : idA - idB;
    })
    .map(([id, type]) => {
      const label = formatQuestionCategorieParentLabel(type);
      return {
        id,
        label,
        title: `N’afficher que les questions « ${label} » (cliquer à nouveau pour tout réafficher)`,
      };
    });
}

/**
 * Sous-types autorisés pour les parents sélectionnés (réunion des `enfants` des nœuds hiérarchie).
 */
export function collectAllowedEnfantIdsUnion(
  hierarchy: RefCategorieHierarchyRow[],
  selectedParentIds: readonly number[],
): Set<number> {
  const out = new Set<number>();
  if (hierarchy.length === 0 || selectedParentIds.length === 0) return out;
  const pset = new Set(selectedParentIds);
  for (const row of hierarchy) {
    if (!pset.has(row.id)) continue;
    for (const e of row.enfants) {
      out.add(e.id);
    }
  }
  return out;
}

export function buildSidebarEnfantChipsForParents(
  hierarchy: RefCategorieHierarchyRow[],
  selectedParentIds: readonly number[],
): SidebarCategoryEnfantChip[] {
  if (hierarchy.length === 0 || selectedParentIds.length === 0) return [];
  const pset = new Set(selectedParentIds);
  const byId = new Map<number, string>();
  for (const row of hierarchy) {
    if (!pset.has(row.id)) continue;
    for (const e of row.enfants) {
      if (!byId.has(e.id)) byId.set(e.id, e.type);
    }
  }
  return [...byId.entries()]
    .sort((a, b) =>
      formatQuestionCategorieEnfantLabel(a[1]).localeCompare(formatQuestionCategorieEnfantLabel(b[1]), "fr"),
    )
    .map(([id, type]) => {
      const label = formatQuestionCategorieEnfantLabel(type);
      return {
        id,
        label,
        title: `N’afficher que les questions avec le sous-type « ${label} »`,
      };
    });
}

/** Si l’API hiérarchie est vide : sous-types présents sur les questions des parents sélectionnés. */
export function buildSidebarEnfantChipsFromQuestionsFallback(
  questions: readonly FlowSidebarQuestionRow[],
  selectedParentIds: readonly number[],
): SidebarCategoryEnfantChip[] {
  if (selectedParentIds.length === 0) return [];
  const pset = new Set(selectedParentIds);
  const byId = new Map<number, string>();
  for (const q of questions) {
    if (!pset.has(q.categorie_id)) continue;
    if (q.categorie_e_id != null && q.categorie_e_type != null && normType(q.categorie_e_type).length > 0) {
      byId.set(q.categorie_e_id, q.categorie_e_type);
    }
  }
  return [...byId.entries()]
    .sort((a, b) =>
      formatQuestionCategorieEnfantLabel(a[1]).localeCompare(formatQuestionCategorieEnfantLabel(b[1]), "fr"),
    )
    .map(([id, type]) => {
      const label = formatQuestionCategorieEnfantLabel(type);
      return {
        id,
        label,
        title: `N’afficher que les questions avec le sous-type « ${label} »`,
      };
    });
}

export function questionMatchesSidebarCategoryFilters(
  q: Pick<FlowSidebarQuestionRow, "categorie_id" | "categorie_e_id">,
  selectedParentId: number | null,
  selectedEnfantId: number | null,
): boolean {
  if (selectedParentId == null && selectedEnfantId == null) return true;
  if (selectedParentId != null && q.categorie_id !== selectedParentId) return false;
  if (selectedEnfantId != null) {
    const eid = q.categorie_e_id;
    if (eid == null || eid !== selectedEnfantId) return false;
  }
  return true;
}
