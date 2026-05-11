import type { PersonaliteImportanceBucket } from "../../../../../../lib/collectionHierarchyVis";
import { PERSONNALITE_IMPORTANCE_ACCENT_HEX } from "../../../../../../lib/collectionHierarchyVis";

/** Libellés courts pour les pastilles d importance sur les lignes. */
export const PERSONALITE_BUCKET_LABEL_FR: Record<PersonaliteImportanceBucket, string> = {
  pionnier: "Pionnier",
  important: "Important",
  secondaire: "Secondaire",
  sans: "Sans niveau",
};

export function personalityRowAccentBucketHex(bucket: PersonaliteImportanceBucket): string {
  return PERSONNALITE_IMPORTANCE_ACCENT_HEX[bucket];
}
