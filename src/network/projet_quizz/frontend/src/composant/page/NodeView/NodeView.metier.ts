import type { FlowSidebarOverlayProps } from "../../ui/organismes/FlowSidebarOverlay/FlowSidebarOverlay.types";

/** Données de démo pour la sidebar du graphe (collections + questions groupées par `category`). */
export const NODE_VIEW_SIDEBAR_DATA: FlowSidebarOverlayProps["data"] = {
  collections: [
    { id: "col-geom", label: "Géométrie plane", level: 1 },
    { id: "col-stat", label: "Statistique & Probabilité", level: 2 },
    { id: "col-adv", label: "Optimisation avancée", level: 3 },
  ],
  questions: [
    { id: "q1", title: "Aire d’un triangle", category: "Géométrie plane" },
    { id: "q2", title: "Théorème de Pythagore", category: "Géométrie plane" },
    { id: "q3", title: "Espérance d’une variable aléatoire", category: "Statistique & Probabilité" },
    { id: "q4", title: "Intervalle de confiance", category: "Statistique & Probabilité" },
    { id: "q5", title: "Descente de gradient", category: "Optimisation avancée" },
  ],
};
