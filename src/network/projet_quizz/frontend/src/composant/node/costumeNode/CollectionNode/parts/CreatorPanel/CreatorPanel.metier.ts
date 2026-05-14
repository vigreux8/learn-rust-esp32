/** Valeur envoyée à l’API (`null` = sans niveau / `importance_id` effacé). */
export type InfluenceurRolePick = "" | "pionnier" | "important" | "secondaire";

export const INFLUENCEUR_ROLE_MENU_OPTIONS: readonly {
  value: InfluenceurRolePick;
  label: string;
}[] = [
  { value: "", label: "Sans niveau" },
  { value: "pionnier", label: "Pionnier" },
  { value: "important", label: "Important" },
  { value: "secondaire", label: "Secondaire" },
] as const;
