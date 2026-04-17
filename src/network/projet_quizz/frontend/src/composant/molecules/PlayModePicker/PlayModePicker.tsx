import { PLAY_MODE_SORT_OPTIONS, type PlayModeSettings } from "./PlayModePicker.types";
import { PLAY_MODE_PICKER_STYLES } from "./PlayModePicker.styles";

/**
 * Props du panneau de choix du mode de lecture (filtres, tri, options KPI, mélange).
 *
 * @property idPrefix - Préfixe pour les attributs `id` et `name` des champs, afin d’éviter les collisions lorsque plusieurs pickers coexistent.
 * @property settings - Objet d’état courant du mode de jeu (`PlayModeSettings`).
 * @property onChange - Callback appelée avec un **patch partiel** à fusionner dans l’état parent après chaque interaction utilisateur.
 * @property labelAlignClass - Classes Tailwind additionnelles pour l’alignement des libellés de section (ex. `text-center`, `sm:text-end`).
 */
export type PlayModePickerProps = {
  idPrefix: string;
  settings: PlayModeSettings;
  onChange: (newSettings: Partial<PlayModeSettings>) => void;
  labelAlignClass?: string;
};


export function PlayModePicker({
  idPrefix,
  settings,
  onChange,
  labelAlignClass = "text-center",
}: PlayModePickerProps) {
  const { neverAnswered, sortBase, errorPriority, shuffleExtra } = settings;
  const lab = `${PLAY_MODE_PICKER_STYLES.optionLabelBase} ${labelAlignClass}`;

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
