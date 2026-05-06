/**
 * Parse une année entière saisie dans le champ (chaîne), ou `null`.
 */
export function parseBirthDeathYear(raw: string): number | null {
  const t = raw.trim();
  if (t === "" || t === "-") return null;
  if (!/^-?\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isSafeInteger(n) && n >= -10000 && n <= 9999 ? n : null;
}

/**
 * Texte d’aide : âge au décès (mort − naissance) ou approximation si décès inconnu.
 */
export function describePersonnaliteAge(
  naissanceStr: string,
  mortStr: string,
  currentYear: number,
): string | null {
  const n = parseBirthDeathYear(naissanceStr);
  if (n === null) return null;
  const m = parseBirthDeathYear(mortStr);
  if (m !== null) {
    const age = m - n;
    if (age < 0) {
      return "Les années sont incohérentes : le décès précèderait la naissance.";
    }
    return `Âge au décès : ${age} an${age === 1 ? "" : "s"} (${n} → ${m}).`;
  }
  const approx = currentYear - n;
  if (approx < 0) return null;
  return (
    `Sans décès renseigné — environ ${approx} an${approx === 1 ? "" : "s"} révolu${approx === 1 ? "" : "s"} ` +
    `en ${currentYear} (approximatif, si la personne est encore en vie ou non).`
  );
}
