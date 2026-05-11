import { useCallback, useEffect, useState } from "preact/hooks";
import { fetchCollections, fetchPersonalitesPicker } from "../../../../../../lib/api";
import type { CollectionUi, PersonalitePickerRowUi } from "../../../../../../types/quizz";
import type {
  UseCollectionsBootstrapOptions,
  UseCollectionsBootstrapResult,
} from "./useCollectionsBootstrap.types";

/**
 * Données initiales de l’écran collections : chargement des collections utilisateur et du picker de personnalités,
 * états loading / erreur, et fonction de rechargement.
 */
export function useCollectionsBootstrap({
  identity,
}: UseCollectionsBootstrapOptions): UseCollectionsBootstrapResult {
  const { userId } = identity;
  const [collections, setCollections] = useState<CollectionUi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalitesPicker, setPersonalitesPicker] = useState<PersonalitePickerRowUi[]>([]);

  const loadBootstrap = useCallback(async (): Promise<{
    list: CollectionUi[];
    picker: PersonalitePickerRowUi[];
  }> => {
    const [list, picker] = await Promise.all([
      fetchCollections(),
      fetchPersonalitesPicker().catch(() => [] as PersonalitePickerRowUi[]),
    ]);
    return { list, picker };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const { list, picker } = await loadBootstrap();
        if (!cancelled) {
          setCollections(list);
          setPersonalitesPicker(picker);
        }
      } catch {
        if (!cancelled) setError("fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadBootstrap, userId]);

  return {
    data: {
      collections,
      setCollections,
      personalitesPicker,
      setPersonalitesPicker,
    },
    loaders: { loadBootstrap },
    status: {
      loading,
      error,
      setLoading,
      setError,
    },
  };
}
