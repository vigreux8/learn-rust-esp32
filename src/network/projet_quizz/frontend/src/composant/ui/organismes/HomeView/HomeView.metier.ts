import type { PlayQtype } from "../../../../lib/playOrder";

export function parsePlayQtypeSelectValue(raw: string): PlayQtype | null {
  if (raw === "histoire" || raw === "pratique" || raw === "connaissance" || raw === "melanger") {
    return raw;
  }
  return null;
}
