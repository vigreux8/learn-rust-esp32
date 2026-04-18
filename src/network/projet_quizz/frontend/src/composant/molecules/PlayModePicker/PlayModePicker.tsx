import { PLAY_MODE_SORT_OPTIONS, type PlayModePickerProps } from "./PlayModePicker.types";
import { PLAY_MODE_PICKER_STYLES } from "./PlayModePicker.styles";

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
