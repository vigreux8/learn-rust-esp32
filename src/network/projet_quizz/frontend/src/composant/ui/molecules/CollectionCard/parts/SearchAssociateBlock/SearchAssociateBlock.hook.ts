import { useEffect, useMemo, useState } from "preact/hooks";
import type { SearchAssociateBlockProps } from "./SearchAssociateBlock.types";

export function useSearchAssociateBlock<T>(props: SearchAssociateBlockProps<T>) {
  const { settings, data, meta, status } = props;
  const max = settings.maxSuggestions ?? 12;
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedId, setSelectedId] = useState<number | "">("");

  useEffect(() => {
    setQuery("");
    setSelectedId("");
    setFocused(false);
  }, [settings.resetKey]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = data.candidates;
    const filtered =
      q === ""
        ? pool.slice(0, max)
        : pool.filter((item) => meta.matchesQuery(item, q)).slice(0, max);
    return filtered;
  }, [data.candidates, meta, max, query]);

  const selectedItem = useMemo(
    () => (selectedId === "" ? undefined : data.candidates.find((c) => meta.getId(c) === selectedId)),
    [selectedId, data.candidates, meta],
  );

  const showPanel = focused && suggestions.length > 0 && !status.interactionLocked;
  const associateDisabled =
    status.interactionLocked || selectedId === "" || status.busy;

  return {
    search: {
      query,
      onQueryChange: setQuery,
      showPanel,
      suggestions,
      onFocus: () => setFocused(true),
      onBlurLater: () => {
        setTimeout(() => setFocused(false), 180);
      },
    },
    selection: {
      selectedId,
      selectedItem,
      pick: (item: T) => {
        setSelectedId(meta.getId(item));
        setQuery(meta.getSuggestionLabel(item));
        setFocused(false);
      },
      clear: () => {
        setSelectedId("");
        setQuery("");
      },
    },
    associate: {
      disabled: associateDisabled,
      labelBusy: status.busy ? "…" : settings.associateLabel,
    },
  };
}
