import type { PlaySortBase } from "../../lib/playOrder";

export type PlayModePickerProps = {
  idPrefix: string;
  neverAnswered: boolean;
  onNeverAnswered: (v: boolean) => void;
  sortBase: PlaySortBase;
  onSortBase: (v: PlaySortBase) => void;
  errorPriority: boolean;
  onErrorPriority: (v: boolean) => void;
  shuffleExtra: boolean;
  onShuffleExtra: (v: boolean) => void;
  /** `text-center` (accueil) ou `sm:text-end` (carte collection). */
  labelAlignClass?: string;
};

/**
 * Choix combinables des modes de jeu (filtre KPI, tri, priorité erreurs, mélange final).
 */
export function PlayModePicker({
  idPrefix,
  neverAnswered,
  onNeverAnswered,
  sortBase,
  onSortBase,
  errorPriority,
  onErrorPriority,
  shuffleExtra,
  onShuffleExtra,
  labelAlignClass = "text-center",
}: PlayModePickerProps) {
  const lab = `mb-1 block text-xs font-semibold uppercase tracking-wide text-base-content/45 ${labelAlignClass}`;

  return (
    <div class="grid w-full gap-3 text-left">
      <label class={lab} for={`${idPrefix}-never`}>
        Filtre
      </label>
      <label class="flex cursor-pointer items-center gap-2 text-sm text-base-content/80">
        <input
          id={`${idPrefix}-never`}
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          checked={neverAnswered}
          onChange={(e) => onNeverAnswered((e.target as HTMLInputElement).checked)}
        />
        Jamais répondues (par moi)
      </label>

      <p class={`${lab} mt-1`}>Tri des questions</p>
      <div class="flex flex-col gap-1.5 text-sm text-base-content/85">
        {(
          [
            ["none", "Par défaut (ordre collection / id)"],
            ["linear", "Linéaire (ordre stable)"],
            ["recent", "Ajout récent d’abord"],
            ["ancien", "Plus anciennes d’abord"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={`${idPrefix}-sort`}
              class="radio radio-sm radio-primary"
              checked={sortBase === value}
              onChange={() => onSortBase(value as PlaySortBase)}
            />
            {label}
          </label>
        ))}
      </div>

      <label class={`${lab} mt-1`} for={`${idPrefix}-err`}>
        Pondération
      </label>
      <label class="flex cursor-pointer items-center gap-2 text-sm text-base-content/80">
        <input
          id={`${idPrefix}-err`}
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          checked={errorPriority}
          onChange={(e) => onErrorPriority((e.target as HTMLInputElement).checked)}
        />
        Priorité aux erreurs (KPI)
      </label>

      <label class={`${lab} mt-1`} for={`${idPrefix}-shuf`}>
        Mélange
      </label>
      <label class="flex cursor-pointer items-center gap-2 text-sm text-base-content/80">
        <input
          id={`${idPrefix}-shuf`}
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          checked={shuffleExtra}
          onChange={(e) => onShuffleExtra((e.target as HTMLInputElement).checked)}
        />
        Mélange aléatoire en fin de chaîne
      </label>
      <p class="text-xs text-base-content/45">
        Ex. « Plus anciennes » + « Priorité erreurs » : tri par date puis tirage pondéré selon tes fautes.
      </p>
    </div>
  );
}
