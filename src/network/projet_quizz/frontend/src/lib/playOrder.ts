import type { QuestionUi } from "../types/quizz";

export type PlayOrder =
  | "random"
  | "linear"
  | "jamais_repondu"
  | "recent"
  | "ancien"
  | "mal_repondu";

/** Tri de base (au plus un) avant les options KPI / aléatoire. */
export type PlaySortBase = "none" | "linear" | "recent" | "ancien";

/** Filtre de type de question pour une session de jeu (API `qtype`). */
export type PlayQtype = "histoire" | "pratique" | "melanger";

const PLAY_ORDERS: readonly PlayOrder[] = [
  "random",
  "linear",
  "jamais_repondu",
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
  return orders.some((x) => x === "jamais_repondu" || x === "mal_repondu");
}

/**
 * Construit la liste des modes dans l’ordre d’application API (filtre → tri → KPI → mélange final).
 */
export function buildPlayOrdersFromPicker(opts: {
  neverAnswered: boolean;
  sortBase: PlaySortBase;
  errorPriority: boolean;
  shuffleExtra: boolean;
}): PlayOrder[] {
  const o: PlayOrder[] = [];
  if (opts.neverAnswered) o.push("jamais_repondu");
  if (opts.sortBase === "linear") o.push("linear");
  else if (opts.sortBase === "recent") o.push("recent");
  else if (opts.sortBase === "ancien") o.push("ancien");
  if (opts.errorPriority) o.push("mal_repondu");
  if (opts.shuffleExtra) o.push("random");
  if (o.length === 0) o.push("random");
  return o;
}

/** Déduit l’état du sélecteur à partir d’une liste de modes (pour pré-remplissage / rejouer). */
export function pickerStateFromPlayOrders(orders: PlayOrder[]): {
  neverAnswered: boolean;
  sortBase: PlaySortBase;
  errorPriority: boolean;
  shuffleExtra: boolean;
} {
  return {
    neverAnswered: orders.includes("jamais_repondu"),
    sortBase: orders.includes("linear")
      ? "linear"
      : orders.includes("recent")
        ? "recent"
        : orders.includes("ancien")
          ? "ancien"
          : "none",
    errorPriority: orders.includes("mal_repondu"),
    shuffleExtra: orders.includes("random"),
  };
}

export type PlaySessionQueryOpts = {
  /** Liste des modes (sérialisée en `order=a,b,c`). */
  orders?: PlayOrder[];
  qtype?: PlayQtype;
  infinite?: boolean;
  userId?: number;
  excludeIds?: number[];
  /** Jeu limité aux questions d’une sous-collection (GET collection avec filtre serveur). */
  sousCollectionId?: number;
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
  if (v === "histoire" || v === "pratique" || v === "melanger") return v;
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

export function playFetchParamsFromSearch(): {
  orders: PlayOrder[];
  qtype: PlayQtype;
  infinite: boolean;
  userId?: number;
  excludeIds: number[];
  sousCollectionId?: number;
  useServerPlayModes: boolean;
} {
  if (typeof window === "undefined") {
    return {
      orders: ["random"],
      qtype: "melanger",
      infinite: false,
      excludeIds: [],
      sousCollectionId: undefined,
      useServerPlayModes: false,
    };
  }
  const s = new URLSearchParams(window.location.search);
  const hasPlayQuery =
    s.has("order") ||
    s.has("qtype") ||
    s.has("infinite") ||
    s.has("userId") ||
    s.has("exclude") ||
    s.has("sousCollectionId");
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
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function shuffleQuestions(questions: QuestionUi[]): QuestionUi[] {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function playQtypeLabel(q: PlayQtype): string {
  if (q === "histoire") return "Histoire";
  if (q === "pratique") return "Pratique";
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
    case "random":
    default:
      return "Aléatoire";
  }
}

export function playOrdersLabel(orders: PlayOrder[]): string {
  return orders.map(playOrderLabel).join(" → ");
}
