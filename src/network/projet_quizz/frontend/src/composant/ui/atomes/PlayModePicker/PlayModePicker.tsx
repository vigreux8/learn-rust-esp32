import { PLAY_MODE_SORT_OPTIONS, type PlayModePickerProps } from "./PlayModePicker.types";
import { PLAY_MODE_PICKER_STYLES } from "./PlayModePicker.styles";

export function PlayModePicker({
  idPrefix,
  settings,
  onChange,
  labelAlignClass = "text-center",
  showReflexionOptions = true,
}: PlayModePickerProps) {
  const {
    neverAnswered,
    wrongAnswered,
    sortBase,
    errorPriority,
    shuffleExtra,
    includeReflexion,
    reflexionSharePercent,
    includeChildCollections,
    childCollectionsMix,
    familyQuotaPercent,
    familyQuotaMax,
    includePersonnaliteFiches,
  } = settings;
  const lab = `${PLAY_MODE_PICKER_STYLES.optionLabelBase} ${labelAlignClass}`;

  let reflexionHint = "—";
  if (includeReflexion) {
    if (reflexionSharePercent <= 0) {
      reflexionHint = "0 % — aucune suite insérée.";
    } else if (reflexionSharePercent >= 100) {
      reflexionHint = "Une suite après chaque question hors chaîne.";
    } else {
      const n = Math.max(
        1,
        Math.round((100 - reflexionSharePercent) / reflexionSharePercent),
      );
      reflexionHint = `${reflexionSharePercent} % — environ une suite toutes les ${n} question(s) hors chaîne.`;
    }
  }

  return (
    <div class={PLAY_MODE_PICKER_STYLES.wrapper}>
      <label class={lab} for={`${idPrefix}-never`}>Filtre</label>
      <label class={PLAY_MODE_PICKER_STYLES.checkboxLabel}>
        <input
          id={`${idPrefix}-never`}
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          checked={neverAnswered}
          onChange={(e) => onChange({ neverAnswered: (e.target as HTMLInputElement).checked })}
        />
        Jamais répondues (par moi)
      </label>
      <label class={PLAY_MODE_PICKER_STYLES.checkboxLabel}>
        <input
          id={`${idPrefix}-wrong`}
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          checked={wrongAnswered}
          onChange={(e) => onChange({ wrongAnswered: (e.target as HTMLInputElement).checked })}
        />
        Mal répondues (par moi)
      </label>

      <p class={`${lab} mt-1`}>Tri des questions</p>
      <div class={PLAY_MODE_PICKER_STYLES.radioGroup}>
        {PLAY_MODE_SORT_OPTIONS.map(([value, label]) => (
          <label key={value} class={PLAY_MODE_PICKER_STYLES.radioLabel}>
            <input
              type="radio"
              name={`${idPrefix}-sort`}
              class="radio radio-sm radio-primary"
              checked={sortBase === value}
              onChange={() => onChange({ sortBase: value })}
            />
            {label}
          </label>
        ))}
      </div>

      <label class={`${lab} mt-1`} for={`${idPrefix}-err`}>Pondération</label>
      <label class={PLAY_MODE_PICKER_STYLES.checkboxLabel}>
        <input
          id={`${idPrefix}-err`}
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          checked={errorPriority}
          onChange={(e) => onChange({ errorPriority: (e.target as HTMLInputElement).checked })}
        />
        Priorité aux erreurs (KPI)
      </label>

      {showReflexionOptions ? (
        <>
          <label class={`${lab} mt-1`} for={`${idPrefix}-refl-inc`}>
            À inclure
          </label>
          <label class={PLAY_MODE_PICKER_STYLES.checkboxLabel}>
            <input
              id={`${idPrefix}-refl-inc`}
              type="checkbox"
              class="checkbox checkbox-sm checkbox-primary"
              checked={includeReflexion}
              onChange={(e) =>
                onChange({ includeReflexion: (e.target as HTMLInputElement).checked })
              }
            />
            Suites logiques (réflexion)
          </label>
          <label class={`${lab} mt-1`} for={`${idPrefix}-refl-share`}>
            Pondération suites logiques
          </label>
          <div class="flex flex-col gap-1">
            <input
              id={`${idPrefix}-refl-share`}
              type="range"
              min={0}
              max={100}
              step={1}
              class="range range-primary range-xs"
              disabled={!includeReflexion}
              value={reflexionSharePercent}
              onChange={(e) => {
                const v = Number((e.target as HTMLInputElement).value);
                if (Number.isFinite(v)) onChange({ reflexionSharePercent: Math.round(v) });
              }}
            />
            <span class="text-xs text-base-content/55">{reflexionHint}</span>
          </div>

          <label class={`${lab} mt-1`} for={`${idPrefix}-child-inc`}>
            Collections liées
          </label>
          <label class={PLAY_MODE_PICKER_STYLES.checkboxLabel}>
            <input
              id={`${idPrefix}-child-inc`}
              type="checkbox"
              class="checkbox checkbox-sm checkbox-primary"
              checked={includeChildCollections}
              onChange={(e) =>
                onChange({ includeChildCollections: (e.target as HTMLInputElement).checked })
              }
            />
            Inclure les collections enfant (sous-collections)
          </label>
          <p class={`${PLAY_MODE_PICKER_STYLES.helper} mb-1`}>
            Hiérarchie Prisma <span class="font-mono text-[10px] opacity-80">relation_collection</span>{" "}
            (parent → enfant). Détail :{" "}
            <span class="font-medium">projet_quizz/architecture.md</span> et{" "}
            <span class="font-medium">backend/prisma/schema.prisma</span>.
          </p>
          <label class={`${lab} mt-1`}>Ordre parent / enfants</label>
          <div class={PLAY_MODE_PICKER_STYLES.radioGroup}>
            <label class={PLAY_MODE_PICKER_STYLES.radioLabel}>
              <input
                type="radio"
                name={`${idPrefix}-child-mix`}
                class="radio radio-sm radio-primary"
                checked={childCollectionsMix === "famille"}
                disabled={!includeChildCollections}
                onChange={() => onChange({ childCollectionsMix: "famille" })}
              />
              Par famille (blocs parent puis chaque enfant)
            </label>
            <label class={PLAY_MODE_PICKER_STYLES.radioLabel}>
              <input
                type="radio"
                name={`${idPrefix}-child-mix`}
                class="radio radio-sm radio-primary"
                checked={childCollectionsMix === "melange"}
                disabled={!includeChildCollections}
                onChange={() => onChange({ childCollectionsMix: "melange" })}
              />
              Mélange global (parent + enfants)
            </label>
          </div>

          <label class={`${lab} mt-1`} for={`${idPrefix}-perso-fiches`}>
            Personnalités liées
          </label>
          <label class={PLAY_MODE_PICKER_STYLES.checkboxLabel}>
            <input
              id={`${idPrefix}-perso-fiches`}
              type="checkbox"
              class="checkbox checkbox-sm checkbox-primary"
              checked={includePersonnaliteFiches}
              onChange={(e) =>
                onChange({ includePersonnaliteFiches: (e.target as HTMLInputElement).checked })
              }
            />
            Inclure les questions des fiches personnalités (pionnier / important / secondaire)
          </label>
          <p class={`${PLAY_MODE_PICKER_STYLES.helper} mb-1`}>
            Via <span class="font-mono text-[10px] opacity-80">personnalité_collection</span> : ajoute
            les questions des collections-fiches des personnalités associées à cette carte.
          </p>

          <label class={`${lab} mt-1`} for={`${idPrefix}-fam-pct`}>
            Part puisée par famille (%)
          </label>
          <div class="flex flex-col gap-1">
            <input
              id={`${idPrefix}-fam-pct`}
              type="range"
              min={0}
              max={100}
              step={1}
              class="range range-primary range-xs"
              disabled={!includeChildCollections}
              value={familyQuotaPercent}
              onChange={(e) => {
                const v = Number((e.target as HTMLInputElement).value);
                if (Number.isFinite(v)) onChange({ familyQuotaPercent: Math.round(v) });
              }}
            />
            <span class="text-xs text-base-content/55">
              {includeChildCollections
                ? `${familyQuotaPercent} % — ${familyQuotaPercent >= 100 ? "toute la famille" : "échantillon aléatoire sans remise dans chaque bloc"}`
                : "—"}
            </span>
          </div>

          <label class={`${lab} mt-1`} for={`${idPrefix}-fam-max`}>
            Plafond par famille (questions)
          </label>
          <div class="flex flex-col gap-1">
            <input
              id={`${idPrefix}-fam-max`}
              type="range"
              min={0}
              max={50}
              step={1}
              class="range range-secondary range-xs"
              disabled={!includeChildCollections}
              value={familyQuotaMax}
              onChange={(e) => {
                const v = Number((e.target as HTMLInputElement).value);
                if (Number.isFinite(v)) onChange({ familyQuotaMax: Math.round(v) });
              }}
            />
            <span class="text-xs text-base-content/55">
              {includeChildCollections
                ? familyQuotaMax <= 0
                  ? "Pas de plafond — seul le % ci-dessus limite le tirage."
                  : `Au plus ${familyQuotaMax} question(s) par famille (parent ou enfant), puis en mélange global les ids sont réordonnés selon tes modes (ex. aléatoire).`
                : "—"}
            </span>
          </div>
        </>
      ) : null}

      <label class={`${lab} mt-1`} for={`${idPrefix}-shuf`}>Mélange</label>
      <label class={PLAY_MODE_PICKER_STYLES.checkboxLabel}>
        <input
          id={`${idPrefix}-shuf`}
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          checked={shuffleExtra}
          onChange={(e) => onChange({ shuffleExtra: (e.target as HTMLInputElement).checked })}
        />
        Mélange aléatoire en fin de chaîne
      </label>
      <p class={PLAY_MODE_PICKER_STYLES.helper}>
        Ex. « Plus anciennes » + « Priorité erreurs » : tri par date puis tirage pondéré selon tes fautes.
      </p>
    </div>
  );
}
