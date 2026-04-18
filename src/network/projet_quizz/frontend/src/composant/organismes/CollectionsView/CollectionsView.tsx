import { AppHeader } from "../../atomes/AppHeader/AppHeader";
import { AppFooter } from "../../atomes/AppFooter/AppFooter";
import { PageMain } from "../../atomes/PageMain/PageMain";
import { Button } from "../../atomes/Button/Button";
import { PopUpInformation } from "../../molecules/PopUpInformation/PopUpInformation";
import { useCollectionsView } from "./CollectionsView.hook";
import { CollectionsContent, CollectionsHeader, JsonImportPanel } from "./CollectionsView.sections";
import { COLLECTIONS_VIEW_STYLES } from "./CollectionsView.styles";

export function CollectionsView() {
  const { page, header, jsonImport, content, confirmPopup, retry } = useCollectionsView();

  return (
    <div class={COLLECTIONS_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain>
        <input
          ref={jsonImport.inputRef}
          type="file"
          accept=".json,application/json"
          class={COLLECTIONS_VIEW_STYLES.hiddenFileInput}
          onChange={jsonImport.onFileChange}
        />

        <CollectionsHeader
          jsonImportOpen={header.jsonImportOpen}
          jsonImportMode={header.jsonImportMode}
          onOpenJsonImport={header.onOpenJsonImport}
        />

        <JsonImportPanel
          jsonImportOpen={jsonImport.open}
          jsonImportMode={jsonImport.mode}
          jsonImportCategorie={jsonImport.categorie}
          jsonImportBusy={jsonImport.busy}
          jsonImportText={jsonImport.text}
          jsonImportError={jsonImport.error}
          jsonImportMessage={jsonImport.message}
          onChangeCategorie={jsonImport.onChangeCategorie}
          onOpenFilePicker={jsonImport.onOpenFilePicker}
          onChangeText={jsonImport.onChangeText}
          onRun={jsonImport.onRun}
        />

        {page.loading ? (
          <p class={COLLECTIONS_VIEW_STYLES.loading}>Chargement...</p>
        ) : page.error ? (
          <div class={COLLECTIONS_VIEW_STYLES.errorBox}>
            <p class={COLLECTIONS_VIEW_STYLES.errorBoxMessage}>
              Impossible de charger les collections (API indisponible ?).
            </p>
            <Button variant="flow" class="btn-sm" onClick={retry.onRetryLoad}>
              Reessayer
            </Button>
          </div>
        ) : (
          <CollectionsContent {...content} />
        )}
      </PageMain>
      <AppFooter />
      <PopUpInformation
        open={confirmPopup.open}
        title={confirmPopup.title}
        message={confirmPopup.message}
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        busy={confirmPopup.busy}
        onCancel={confirmPopup.onCancel}
        onConfirm={confirmPopup.onConfirm}
      />
    </div>
  );
}
