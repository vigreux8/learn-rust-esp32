import { useEffect, useState } from "preact/hooks";
import { X } from "lucide-preact";
import { Button } from "../../../../ui/atomes/Button/Button";
import type { CreatePersonnaliteModalProps } from "./CreatePersonnaliteModal.types";
import { describePersonnaliteAge, parseBirthDeathYear } from "./CreatePersonnaliteModal.metier";

export function CreatePersonnaliteModal({
  open,
  busy,
  error,
  tagOptions,
  onClose,
  onSubmit,
}: CreatePersonnaliteModalProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [naissance, setNaissance] = useState("");
  const [mort, setMort] = useState("");
  const [resumer, setResumer] = useState("");
  const [tagCollectionId, setTagCollectionId] = useState<number | "">("");

  useEffect(() => {
    if (!open) {
      setNom("");
      setPrenom("");
      setNaissance("");
      setMort("");
      setResumer("");
      setTagCollectionId("");
    }
  }, [open]);

  if (!open) return null;

  const birthY = parseBirthDeathYear(naissance);
  const deathY = parseBirthDeathYear(mort);
  const mortalityOk =
    mort.trim() === "" || (deathY !== null && birthY !== null && deathY >= birthY);
  /** Décès vide ou année valide dans la plage (pas de saisie partielle illisible). */
  const deathFieldOk = mort.trim() === "" || deathY !== null;
  const ageHint =
    birthY !== null ? describePersonnaliteAge(naissance, mort, new Date().getFullYear()) : null;
  const canSubmit =
    Boolean(nom.trim() && prenom.trim()) && birthY !== null && deathFieldOk && mortalityOk;

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-personnalite-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        class="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-base-content/15 bg-base-100 p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <h2 id="create-personnalite-title" class="text-lg font-semibold text-base-content">
            Nouvelle collection personnalité
          </h2>
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-square shrink-0"
            aria-label="Fermer"
            disabled={busy}
            onClick={onClose}
          >
            <X class="h-4 w-4" aria-hidden />
          </button>
        </div>
        <p class="mb-4 text-xs text-base-content/60">
          Une collection sera créée avec le titre « Prénom Nom » puis liée à la fiche personnalité.
        </p>
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-base-content/65" for="perso-prenom">Prénom</label>
              <input id="perso-prenom" class="input input-bordered input-sm w-full rounded-xl" value={prenom} disabled={busy}
                onInput={(e) => setPrenom((e.target as HTMLInputElement).value)} />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-base-content/65" for="perso-nom">Nom</label>
              <input id="perso-nom" class="input input-bordered input-sm w-full rounded-xl" value={nom} disabled={busy}
                onInput={(e) => setNom((e.target as HTMLInputElement).value)} />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-base-content/65" for="perso-naissance">Année de naissance</label>
              <input
                id="perso-naissance"
                class="input input-bordered input-sm w-full rounded-xl"
                type="number"
                inputMode="numeric"
                step={1}
                value={naissance}
                disabled={busy}
                placeholder="ex. 1400"
                onInput={(e) => setNaissance((e.target as HTMLInputElement).value)}
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-base-content/65" for="perso-mort">Année du décès (optionnel)</label>
              <input
                id="perso-mort"
                class="input input-bordered input-sm w-full rounded-xl"
                type="number"
                inputMode="numeric"
                step={1}
                value={mort}
                disabled={busy}
                placeholder="vide si vivant ou inconnu"
                onInput={(e) => setMort((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          {ageHint ? (
            <p class="rounded-lg border border-base-content/10 bg-base-200/40 px-3 py-2 text-xs text-base-content/80">{ageHint}</p>
          ) : null}
          {!mortalityOk && mort.trim() !== "" ? (
            <p class="text-xs text-error">L’année de décès doit être supérieure ou égale à l’année de naissance.</p>
          ) : null}
          <div>
            <label class="mb-1 block text-xs font-medium text-base-content/65" for="perso-resume">Résumé</label>
            <textarea id="perso-resume" class="textarea textarea-bordered w-full rounded-xl text-sm min-h-24"
              disabled={busy} value={resumer}
              onInput={(e) => setResumer((e.target as HTMLTextAreaElement).value)} />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-base-content/65" htmlFor="perso-tag">Collection-étiquette (optionnel)</label>
            <select id="perso-tag" class="select select-bordered select-sm w-full rounded-xl"
              disabled={busy || tagOptions.length === 0}
              value={tagCollectionId === "" ? "" : String(tagCollectionId)}
              onChange={(e) => setTagCollectionId((e.target as HTMLSelectElement).value === "" ? "" : Number((e.target as HTMLSelectElement).value))}>
              <option value="">—</option>
              {tagOptions.map((m) => (<option key={m.id} value={m.id}>{m.nom}</option>))}
            </select>
          </div>
        </div>
        {error ? <p class="mt-3 text-xs text-error">{error}</p> : null}
        <div class="mt-5 flex justify-end gap-2">
          <Button variant="outline" class="btn-sm" disabled={busy} onClick={onClose}>Annuler</Button>
          <Button
            variant="flow"
            class="btn-sm"
            disabled={busy || !canSubmit}
            onClick={() => {
              if (birthY === null) return;
              void onSubmit({
                nom: nom.trim(),
                prenom: prenom.trim(),
                naissance: birthY,
                mort: mort.trim() === "" ? null : deathY,
                resumer: resumer.trim(),
                tagCollectionId,
              });
            }}
          >
            {busy ? "Création…" : "Créer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
