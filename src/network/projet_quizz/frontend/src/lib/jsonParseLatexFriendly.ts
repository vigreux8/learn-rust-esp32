/**
 * Tolère du LaTeX avec des \commandes non échappées dans les chaînes JSON collées par un LLM.
 * Ne modifie que l’intérieur des littéraux "…".
 */

function isUnicodeEscape(source: string, backslashIndex: number): boolean {
  if (source[backslashIndex + 1] !== "u") return false;
  const hex = source.slice(backslashIndex + 2, backslashIndex + 6);
  return /^[0-9a-fA-F]{4}$/.test(hex);
}

function countTrailingBackslashes(source: string, beforeIndex: number): number {
  let n = 0;
  for (let j = beforeIndex - 1; j >= 0 && source[j] === "\\"; j -= 1) {
    n += 1;
  }
  return n;
}

/** Prépare un JSON collé pour JSON.parse (LaTeX : \\frac, \\pi, …). */
export function sanitizeJsonTextForLatexBackslashesInStrings(source: string): string {
  let out = "";
  let i = 0;
  let inString = false;

  while (i < source.length) {
    const c = source[i];

    if (!inString) {
      if (c === '"') {
        inString = true;
        out += '"';
        i += 1;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      if (countTrailingBackslashes(source, i) % 2 === 1) {
        out += '"';
        i += 1;
        continue;
      }
      inString = false;
      out += '"';
      i += 1;
      continue;
    }

    if (c === "\\") {
      const next = source[i + 1];
      if (next === undefined) {
        out += "\\\\";
        break;
      }

      if (next === "\\") {
        out += "\\\\";
        i += 2;
        continue;
      }

      if (next === '"' || next === "/") {
        out += "\\" + next;
        i += 2;
        continue;
      }

      if (next === "u" && isUnicodeEscape(source, i)) {
        out += source.slice(i, i + 6);
        i += 6;
        continue;
      }

      if (next === "n") {
        out += "\\n";
        i += 2;
        continue;
      }

      if ("bftr".includes(next)) {
        const after = source[i + 2];
        if (after !== undefined && /[a-zA-Z]/.test(after)) {
          out += "\\\\" + next;
          i += 2;
          continue;
        }
        out += "\\" + next;
        i += 2;
        continue;
      }

      out += "\\\\" + next;
      i += 2;
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

/** Comme JSON.parse, avec secours si le JSON contient des échappements LaTeX invalides. */
export function parseJsonWithLatexFriendlyBackslashes(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return JSON.parse(sanitizeJsonTextForLatexBackslashesInStrings(raw)) as unknown;
  }
}
