import type { AppEdge, AppNode } from "../composant/node/config/flow.types";
import type { ChildCollectionsMix, PlayQtype } from "./playOrder";
import type { PlayModeSettings } from "../composant/ui/atomes/PlayModePicker/PlayModePicker.types";

const STORAGE_KEY = "quizz-node-view-graph-session";

/** Préférences UI du graphe `/node` (clé séparée pour ne pas versionner tout le payload graphe). */
const UI_SETTINGS_KEY = "quizz-node-graph-ui-settings";

/** Options d’affichage / comportement côté graphe (sidebar, déplacements). */
export type NodeViewGraphUiSettings = {
  /**
   * Si vrai (défaut), après déplacement d’une question vers une autre collection : surbrillance +
   * défilement vers la ligne dans le panneau Questions.
   */
  focusQuestionAfterCollectionMove: boolean;
};

export function defaultNodeViewGraphUiSettings(): NodeViewGraphUiSettings {
  return { focusQuestionAfterCollectionMove: true };
}

export function readNodeViewGraphUiSettings(): NodeViewGraphUiSettings {
  if (typeof sessionStorage === "undefined") return defaultNodeViewGraphUiSettings();
  try {
    const raw = sessionStorage.getItem(UI_SETTINGS_KEY);
    if (raw == null || raw === "") return defaultNodeViewGraphUiSettings();
    const p = JSON.parse(raw) as unknown;
    if (p === null || typeof p !== "object" || Array.isArray(p)) return defaultNodeViewGraphUiSettings();
    const rec = p as Record<string, unknown>;
    return {
      focusQuestionAfterCollectionMove:
        typeof rec.focusQuestionAfterCollectionMove === "boolean"
          ? rec.focusQuestionAfterCollectionMove
          : true,
    };
  } catch {
    return defaultNodeViewGraphUiSettings();
  }
}

export function writeNodeViewGraphUiSettings(settings: NodeViewGraphUiSettings): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* quota / mode privé */
  }
}
/** v2 : inclut `playUi` (options panneau Mode jeu). v1 : graphe uniquement. */
const STORAGE_VERSION = 2;
const STORAGE_VERSION_LEGACY = 1;

export type NodeViewGraphViewport = { x: number; y: number; zoom: number };

/** Options du panneau « Mode jeu » `/node`, persistées avec le graphe. */
export type NodeViewGraphPlayUiSnapshot = {
  playMode: PlayModeSettings;
  playQtype: PlayQtype;
  playInfinite: boolean;
  panelExpanded: boolean;
};

export type NodeViewGraphSessionPayload = {
  version: number;
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: NodeViewGraphViewport | null;
  questionsScopeCollectionId: number | null;
  playUi?: NodeViewGraphPlayUiSnapshot;
};

export function defaultPlayModeSettings(): PlayModeSettings {
  return {
    neverAnswered: false,
    wrongAnswered: false,
    sortBase: "none",
    errorPriority: false,
    shuffleExtra: false,
    includeReflexion: false,
    reflexionSharePercent: 25,
    includeChildCollections: false,
    childCollectionsMix: "famille",
    familyQuotaPercent: 100,
    familyQuotaMax: 0,
    includePersonnaliteFiches: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidViewport(value: unknown): value is NodeViewGraphViewport {
  if (!isRecord(value)) return false;
  return (
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.zoom === "number" &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    Number.isFinite(value.zoom)
  );
}

function isPlaySortBase(v: unknown): v is PlayModeSettings["sortBase"] {
  return v === "none" || v === "linear" || v === "recent" || v === "ancien";
}

function isChildCollectionsMix(v: unknown): v is ChildCollectionsMix {
  return v === "famille" || v === "melange";
}

function isPlayQtype(v: unknown): v is PlayQtype {
  return v === "histoire" || v === "pratique" || v === "connaissance" || v === "melanger";
}

function boolish(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function numish(v: unknown, fallback: number, min: number, max: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}

/**
 * Recompose un `PlayModeSettings` tolérant une sauvegarde partielle / ancienne forme.
 */
export function normalizeStoredPlayMode(raw: unknown): PlayModeSettings {
  const d = defaultPlayModeSettings();
  if (!isRecord(raw)) return d;
  return {
    neverAnswered: boolish(raw.neverAnswered, d.neverAnswered),
    wrongAnswered: boolish(raw.wrongAnswered, d.wrongAnswered),
    sortBase: isPlaySortBase(raw.sortBase) ? raw.sortBase : d.sortBase,
    errorPriority: boolish(raw.errorPriority, d.errorPriority),
    shuffleExtra: boolish(raw.shuffleExtra, d.shuffleExtra),
    includeReflexion: boolish(raw.includeReflexion, d.includeReflexion),
    reflexionSharePercent: numish(raw.reflexionSharePercent, d.reflexionSharePercent, 0, 100),
    includeChildCollections: boolish(raw.includeChildCollections, d.includeChildCollections),
    childCollectionsMix: isChildCollectionsMix(raw.childCollectionsMix)
      ? raw.childCollectionsMix
      : d.childCollectionsMix,
    familyQuotaPercent: numish(raw.familyQuotaPercent, d.familyQuotaPercent, 0, 100),
    familyQuotaMax: numish(raw.familyQuotaMax, d.familyQuotaMax, 0, 500),
    includePersonnaliteFiches: boolish(raw.includePersonnaliteFiches, d.includePersonnaliteFiches),
  };
}

export function parsePlayUiSnapshot(raw: unknown): NodeViewGraphPlayUiSnapshot | null {
  if (!isRecord(raw)) return null;
  const playMode = normalizeStoredPlayMode(raw.playMode);
  const playQtype = isPlayQtype(raw.playQtype) ? raw.playQtype : "melanger";
  const playInfinite = boolish(raw.playInfinite, false);
  const panelExpanded = boolish(raw.panelExpanded, false);
  return { playMode, playQtype, playInfinite, panelExpanded };
}

/**
 * Lit le dernier état graphe `/node` sauvegardé en session (onglet courant).
 * Accepte la version 1 (sans `playUi`) et la version 2.
 */
export function readStoredNodeViewGraph(): NodeViewGraphSessionPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const ver = parsed.version;
    if (ver !== STORAGE_VERSION && ver !== STORAGE_VERSION_LEGACY) return null;
    if (!Array.isArray(parsed.nodes)) return null;
    if (!Array.isArray(parsed.edges)) return null;
    const viewport =
      parsed.viewport === null || parsed.viewport === undefined
        ? null
        : isValidViewport(parsed.viewport)
          ? parsed.viewport
          : null;
    const q =
      parsed.questionsScopeCollectionId === null || parsed.questionsScopeCollectionId === undefined
        ? null
        : typeof parsed.questionsScopeCollectionId === "number" &&
            Number.isFinite(parsed.questionsScopeCollectionId)
          ? parsed.questionsScopeCollectionId
          : null;
    const playUi =
      ver === STORAGE_VERSION && parsed.playUi !== undefined
        ? parsePlayUiSnapshot(parsed.playUi)
        : null;
    return {
      version: STORAGE_VERSION,
      nodes: parsed.nodes as AppNode[],
      edges: parsed.edges as AppEdge[],
      viewport,
      questionsScopeCollectionId: q,
      ...(playUi != null ? { playUi } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * Lit les options « Mode jeu » depuis la session graphe, ou valeurs par défaut.
 */
export function readStoredPlayUiSnapshot(): NodeViewGraphPlayUiSnapshot {
  const g = readStoredNodeViewGraph();
  if (g?.playUi != null) return g.playUi;
  return {
    playMode: defaultPlayModeSettings(),
    playQtype: "melanger",
    playInfinite: false,
    panelExpanded: false,
  };
}

/**
 * Fusionne les options « Mode jeu » dans la session (même clé que le graphe).
 * Si aucune session graphe n’existe encore, crée une entrée minimale (nœuds vides) pour ne perdre que les options.
 */
export function writeStoredNodeViewGraphMergePlayUi(playUi: NodeViewGraphPlayUiSnapshot): void {
  const prev = readStoredNodeViewGraph();
  if (prev != null) {
    writeStoredNodeViewGraph({
      nodes: prev.nodes,
      edges: prev.edges,
      viewport: prev.viewport ?? { x: 0, y: 0, zoom: 1 },
      questionsScopeCollectionId: prev.questionsScopeCollectionId,
      playUi,
    });
  } else {
    writeStoredNodeViewGraph({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      questionsScopeCollectionId: null,
      playUi,
    });
  }
}

/**
 * Enregistre nœuds, arêtes, viewport, périmètre questions et — si fourni — `playUi`.
 * Si `playUi` est omis, conserve la valeur déjà stockée (synchronisation avec le panneau Mode jeu).
 */
export function writeStoredNodeViewGraph(payload: {
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: NodeViewGraphViewport;
  questionsScopeCollectionId: number | null;
  playUi?: NodeViewGraphPlayUiSnapshot;
}): void {
  if (typeof sessionStorage === "undefined") return;
  const prev = readStoredNodeViewGraph();
  const playUi = payload.playUi !== undefined ? payload.playUi : prev?.playUi;
  const body: NodeViewGraphSessionPayload = {
    version: STORAGE_VERSION,
    nodes: payload.nodes.map((n) => ({ ...n, selected: false })),
    edges: payload.edges,
    viewport: payload.viewport,
    questionsScopeCollectionId: payload.questionsScopeCollectionId,
    ...(playUi != null ? { playUi } : {}),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(body));
}
