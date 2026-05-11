import type { PersonaliteImportanceBucket } from "../../../../../../lib/collectionHierarchyVis";
import { PERSONNALITE_IMPORTANCE_ACCENT_HEX } from "../../../../../../lib/collectionHierarchyVis";

export const PERSONALITE_FILTER_BUCKET_ORDER: PersonaliteImportanceBucket[] = [
  "pionnier",
  "important",
  "secondaire",
  "sans",
];

export const PERSONALITE_BUCKET_LABEL_FR: Record<PersonaliteImportanceBucket, string> = {
  pionnier: "Pionnier",
  important: "Important",
  secondaire: "Secondaire",
  sans: "Sans niveau",
};

export function personalityFilterChipHex(bucket: PersonaliteImportanceBucket): string {
  return PERSONNALITE_IMPORTANCE_ACCENT_HEX[bucket];
}
