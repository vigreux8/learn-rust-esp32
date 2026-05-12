import type { QuestionUi, ReponseUi } from "../types/quizz";

export type PlayOrder =
  | "random"
  | "linear"
  | "jamais_repondu"
  | "mal_repondu_filtre"
  | "recent"
  | "ancien"
  | "mal_repondu";

/** Tri de base (au plus un) avant les options KPI / aléatoire. */
export type PlaySortBase = "none" | "linear" | "recent" | "ancien";

/** Filtre de type de question pour une session de jeu (API `qtype`, `ref_p_categorie.type`). */
export type PlayQtype = "histoire" | "pratique" | "connaissance" | "melanger";

const PLAY_ORDERS: readonly PlayOrder[] = [
  "random",
  "linear",
  "jamais_repondu",
  "mal_repondu_filtre",
  "recent",
  "ancien",
  "mal_repondu",
] as const;

export function isPlayOrder(value: string): value is PlayOrder {
  return (PLAY_ORDERS as readonly string[]).includes(value);
}

export function parsePlayOrdersFromString(raw: string): PlayOrder[] {
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const out: PlayOrder[] = [];
  for (const p of parts) {
    if (isPlayOrder(p)) out.push(p);
  }
  return out.length > 0 ? out : ["random"];
}

export function playOrdersRequireUserId(orders: PlayOrder[]): boolean {
  return orders.some(
    (x) => x === "jamais_repondu" || x === "mal_repondu" || x === "mal_repondu_filtre",
  );
}

/**
 * Construit la liste des modes dans l’ordre d’application API (filtre → tri → KPI → mélange final).
 */
export function buildPlayOrdersFromPicker(opts: {
  neverAnswered: boolean;
  wrongAnswered: boolean;
  sortBase: PlaySortBase;
  errorPriority: boolean;
  shuffleExtra: boolean;
}): PlayOrder[] {
  const o: PlayOrder[] = [];
  if (opts.neverAnswered) o.push("jamais_repondu");
  if (opts.wrongAnswered) o.push("mal_repondu_filtre");
  if (opts.sortBase === "linear") o.push("linear");
  else if (opts.sortBase === "recent") o.push("recent");
  else if (opts.sortBase === "ancien") o.push("ancien");
  if (opts.errorPriority) o.push("mal_repondu");
  if (opts.shuffleExtra) o.push("random");
  if (o.length === 0) o.push("random");
  return o;
}

/** Mélange parent + collections enfants (`GET /quizz/collections/:id?includeChildren=1`). */
export type ChildCollectionsMix = "famille" | "melange";

export type PlaySessionQueryOpts = {
  /** Liste des modes (sérialisée en `order=a,b,c`). */
  orders?: PlayOrder[];
  qtype?: PlayQtype;
  infinite?: boolean;
  userId?: number;
  excludeIds?: number[];
  /** Jeu limité aux questions d’une sous-collection (GET collection avec filtre serveur). */
  sousCollectionId?: number;
  /** Suites logiques (réflexion) : premier groupe de la collection, GET reflexion-chain. */
  includeReflexion?: boolean;
  /** Part cible des blocs réflexion (0–100), sérialisée `reflexionShare`. */
  reflexionSharePercent?: number;
  /** Inclure les questions des collections enfants (`relation-collection`, voir `architecture.md`). */
  includeChildCollections?: boolean;
  childCollectionsMix?: ChildCollectionsMix;
  /** Part du paquet par famille (0–100), query `familyQuota`. */
  familyQuotaPercent?: number;
  /** Plafond questions par famille (0 = désactivé), query `familyMax`. */
  familyQuotaMax?: number;
  /** Fiches personnalités liées à la carte, query `persoFiches`. */
  includePersonnaliteFiches?: boolean;
  /** Origine graphe `/node` : query `from=node` pour le bouton Retour de la session. */
  fromNode?: boolean;
};

export function playOrdersFromSearch(): PlayOrder[] {
  if (typeof window === "undefined") return ["random"];
  const v = new URLSearchParams(window.location.search).get("order");
  if (v == null || v === "") return ["random"];
  return parsePlayOrdersFromString(v);
}

export function playQtypeFromSearch(): PlayQtype {
  if (typeof window === "undefined") return "melanger";
  const v = new URLSearchParams(window.location.search).get("qtype");
  if (v === "histoire" || v === "pratique" || v === "connaissance" || v === "melanger") return v;
  return "melanger";
}

export function playInfiniteFromSearch(): boolean {
  if (typeof window === "undefined") return false;
  const v = new URLSearchParams(window.location.search).get("infinite");
  return v === "1" || v === "true";
}

function parseExcludeIdsFromSearch(search: URLSearchParams): number[] {
  const raw = search.get("exclude");
  if (raw == null || raw === "") return [];
  return raw
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function parseSousCollectionIdFromSearch(search: URLSearchParams): number | undefined {
  const raw = search.get("sousCollectionId");
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return undefined;
  return n;
}

function parseReflexionShareFromSearch(search: URLSearchParams): number {
  const raw = search.get("reflexionShare");
  if (raw == null || raw === "") return 25;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 25;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function parseIncludeReflexionFromSearch(search: URLSearchParams): boolean {
  const v = search.get("reflexion");
  return v === "1" || v === "true" || v === "yes";
}

function parseIncludeChildCollectionsFromSearch(search: URLSearchParams): boolean {
  const v = search.get("includeChildren");
  return v === "1" || v === "true" || v === "yes";
}

function parseChildCollectionsMixFromSearch(search: URLSearchParams): ChildCollectionsMix {
  const v = search.get("childrenMix");
  if (v != null && v.trim().toLowerCase() === "famille") return "famille";
  return "melange";
}

function parseFamilyQuotaFromSearch(search: URLSearchParams): number {
  const raw = search.get("familyQuota");
  if (raw == null || raw === "") return 100;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 100;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** 0 si absent ou 0 : pas de plafond côté API. */
function parseFamilyMaxFromSearch(search: URLSearchParams): number {
  const raw = search.get("familyMax");
  if (raw == null || raw === "") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(500, Math.floor(n));
}

function parseIncludePersoFichesFromSearch(search: URLSearchParams): boolean {
  const v = search.get("persoFiches");
  return v === "1" || v === "true" || v === "yes";
}

export function playFetchParamsFromSearch(): {
  orders: PlayOrder[];
  qtype: PlayQtype;
  infinite: boolean;
  userId?: number;
  excludeIds: number[];
  sousCollectionId?: number;
  useServerPlayModes: boolean;
  includeReflexion: boolean;
  reflexionSharePercent: number;
  includeChildCollections: boolean;
  childCollectionsMix: ChildCollectionsMix;
  familyQuotaPercent: number;
  familyQuotaMax: number;
  includePersonnaliteFiches: boolean;
} {
  if (typeof window === "undefined") {
    return {
      orders: ["random"],
      qtype: "melanger",
      infinite: false,
      excludeIds: [],
      sousCollectionId: undefined,
      useServerPlayModes: false,
      includeReflexion: false,
      reflexionSharePercent: 25,
      includeChildCollections: false,
      childCollectionsMix: "famille",
      familyQuotaPercent: 100,
      familyQuotaMax: 0,
      includePersonnaliteFiches: false,
    };
  }
  const s = new URLSearchParams(window.location.search);
  const hasPlayQuery =
    s.has("order") ||
    s.has("qtype") ||
    s.has("infinite") ||
    s.has("userId") ||
    s.has("exclude") ||
    s.has("sousCollectionId") ||
    s.has("reflexion") ||
    s.has("reflexionShare") ||
    s.has("includeChildren") ||
    s.has("childrenMix") ||
    s.has("familyQuota") ||
    s.has("familyMax") ||
    s.has("persoFiches");
  const userIdRaw = s.get("userId");
  const userIdParsed = userIdRaw != null && userIdRaw !== "" ? Number(userIdRaw) : NaN;
  return {
    orders: playOrdersFromSearch(),
    qtype: playQtypeFromSearch(),
    infinite: playInfiniteFromSearch(),
    userId: Number.isInteger(userIdParsed) && userIdParsed >= 1 ? userIdParsed : undefined,
    excludeIds: parseExcludeIdsFromSearch(s),
    sousCollectionId: parseSousCollectionIdFromSearch(s),
    useServerPlayModes: hasPlayQuery,
    includeReflexion: parseIncludeReflexionFromSearch(s),
    reflexionSharePercent: parseReflexionShareFromSearch(s),
    includeChildCollections: parseIncludeChildCollectionsFromSearch(s),
    childCollectionsMix: parseChildCollectionsMixFromSearch(s),
    familyQuotaPercent: parseFamilyQuotaFromSearch(s),
    familyQuotaMax: parseFamilyMaxFromSearch(s),
    includePersonnaliteFiches: parseIncludePersoFichesFromSearch(s),
  };
}

export function buildPlaySessionQuery(opts: PlaySessionQueryOpts): string {
  const p = new URLSearchParams();
  const orders: PlayOrder[] =
    opts.orders != null && opts.orders.length > 0 ? opts.orders : ["random"];
  p.set("order", orders.join(","));
  const qtype = opts.qtype ?? "melanger";
  if (qtype !== "melanger") p.set("qtype", qtype);
  if (opts.infinite) p.set("infinite", "1");
  if (opts.userId != null && playOrdersRequireUserId(orders)) {
    p.set("userId", String(opts.userId));
  }
  if (opts.excludeIds != null && opts.excludeIds.length > 0) {
    p.set("exclude", opts.excludeIds.join(","));
  }
  if (opts.sousCollectionId != null) {
    p.set("sousCollectionId", String(opts.sousCollectionId));
  }
  if (opts.includeReflexion === true) {
    p.set("reflexion", "1");
  }
  if (opts.reflexionSharePercent != null && opts.reflexionSharePercent !== 25) {
    p.set("reflexionShare", String(opts.reflexionSharePercent));
  }
  if (opts.includeChildCollections === true) {
    p.set("includeChildren", "1");
  }
  if (opts.childCollectionsMix != null && opts.childCollectionsMix !== "melange") {
    p.set("childrenMix", opts.childCollectionsMix);
  }
  if (opts.includeChildCollections === true) {
    if (opts.familyQuotaPercent != null && opts.familyQuotaPercent !== 100) {
      p.set("familyQuota", String(opts.familyQuotaPercent));
    }
    if (opts.familyQuotaMax != null && opts.familyQuotaMax > 0) {
      p.set("familyMax", String(opts.familyQuotaMax));
    }
  }
  if (opts.includePersonnaliteFiches === true) {
    p.set("persoFiches", "1");
  }
  if (opts.fromNode === true) {
    p.set("from", "node");
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function playSessionFromNodeFromSearch(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("from") === "node";
}

export function shuffleQuestions(questions: QuestionUi[]): QuestionUi[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Ordre aléatoire des propositions (ids et `bonne_reponse` inchangés). */
export function shuffleQuestionAnswers(reponses: ReponseUi[]): ReponseUi[] {
  const out = [...reponses];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function playQtypeLabel(q: PlayQtype): string {
  if (q === "histoire") return "Histoire";
  if (q === "pratique") return "Pratique";
  if (q === "connaissance") return "Connaissance";
  return "Mélanger";
}

export function playOrderLabel(order: PlayOrder): string {
  switch (order) {
    case "linear":
      return "Ordre linéaire";
    case "jamais_repondu":
      return "Jamais répondues";
    case "recent":
      return "Ajout récent d’abord";
    case "ancien":
      return "Plus anciennes d’abord";
    case "mal_repondu":
      return "Priorité aux erreurs";
    case "mal_repondu_filtre":
      return "Mal répondues";
    case "random":
    default:
      return "Aléatoire";
  }
}

export function playOrdersLabel(orders: PlayOrder[]): string {
  return orders.map(playOrderLabel).join(" → ");
}
