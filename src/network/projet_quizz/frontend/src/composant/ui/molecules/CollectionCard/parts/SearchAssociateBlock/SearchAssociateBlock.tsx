import { Button } from "../../../../atomes/Button/Button";
import { SEARCH_ASSOCIATE_BLOCK_STYLES } from "./SearchAssociateBlock.styles";
import { useSearchAssociateBlock } from "./SearchAssociateBlock.hook";
import type { SearchAssociateBlockProps } from "./SearchAssociateBlock.types";

export function SearchAssociateBlock<T>(props: SearchAssociateBlockProps<T>) {
  const { settings, meta, actions, slots } = props;
  const { search, selection, associate } = useSearchAssociateBlock(props);

  return (
    <div class={SEARCH_ASSOCIATE_BLOCK_STYLES.section} onClick={(e) => e.stopPropagation()}>
      <p class={SEARCH_ASSOCIATE_BLOCK_STYLES.title}>{settings.title}</p>
      <div class="relative">
        <label class="sr-only" for={settings.inputId}>
          {settings.placeholder}
        </label>
        <input
          id={settings.inputId}
          type="search"
          autoComplete="off"
          class="input input-bordered input-sm w-full rounded-xl border-base-content/15 bg-base-100"
          placeholder={settings.placeholder}
          disabled={props.status.interactionLocked}
          value={search.query}
          onInput={(e) => search.onQueryChange((e.target as HTMLInputElement).value)}
          onFocus={search.onFocus}
          onBlur={search.onBlurLater}
        />
        {search.showPanel ? (
          <ul
            class={SEARCH_ASSOCIATE_BLOCK_STYLES.listPanel}
            role="listbox"
            aria-label={settings.title}
          >
            {search.suggestions.map((row) => (
              <li key={meta.getId(row)} role="option">
                <button
                  type="button"
                  class={SEARCH_ASSOCIATE_BLOCK_STYLES.suggestBtn}
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => selection.pick(row)}
                >
                  <span class="font-medium text-base-content">{meta.getSuggestionLabel(row)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {selection.selectedItem != null ? (
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-base-content/60">
            Sélection :{" "}
            <span class="font-medium text-base-content">
              {meta.getSuggestionLabel(selection.selectedItem)}
            </span>
          </span>
          <button
            type="button"
            class="btn btn-ghost btn-xs rounded-full"
            disabled={props.status.interactionLocked}
            onClick={() => selection.clear()}
          >
            Changer
          </button>
        </div>
      ) : null}
      {slots?.betweenSelectionAndButton}
      <Button
        variant="outline"
        class="btn-sm w-fit"
        disabled={associate.disabled}
        onClick={() => {
          if (selection.selectedId === "") return;
          void actions.onAssociate(selection.selectedId as number);
        }}
      >
        {associate.labelBusy}
      </Button>
    </div>
  );
}
