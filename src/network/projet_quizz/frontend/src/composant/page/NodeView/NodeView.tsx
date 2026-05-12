import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { NodeViewGraphActionsContext } from "../../../lib/nodeViewGraphActionsContext";
import { AppHeader } from "../../ui/atomes/AppHeader/AppHeader";
import { PageMain } from "../../ui/atomes/PageMain/PageMain";
import { FlowSidebarOverlay } from "../../ui/organismes/FlowSidebarOverlay";
import { CreatePersonnaliteModal } from "../CollectionsView/parts/CreatePersonnaliteModal";
import { GraphCreateNormaleCollectionModal } from "./parts/GraphCreateNormaleCollectionModal";
import { NodeViewLlmImportModal } from "./parts/NodeViewLlmImportModal/NodeViewLlmImportModal";
import { useNodeViewFlow } from "./NodeView.hook";
import { NODE_VIEW_STYLES } from "./NodeView.styles";
import type { NodeViewProps } from "./NodeView.types";

/**
 * Zone graphe + sidebar : doit vivre sous `ReactFlowProvider` pour `useReactFlow` dans le hook.
 */
function NodeViewFlowWorkspace(props: Pick<NodeViewProps, "actions">) {
  const { flow, sidebar, graphModals, graphActions, llmImportModal } = useNodeViewFlow({ actions: props.actions });

  return (
    <NodeViewGraphActionsContext.Provider value={graphActions}>
    <div class={NODE_VIEW_STYLES.flowShell}>
      <div class={`${NODE_VIEW_STYLES.canvasInner} relative`}>
        <ReactFlow
          className="h-full w-full"
          nodes={flow.nodes}
          edges={flow.edges}
          onNodesChange={flow.onNodesChange}
          onEdgesChange={flow.onEdgesChange}
          onConnect={flow.onConnect}
          onDrop={flow.onDrop}
          onDragOver={flow.onDragOver}
          onSelectionChange={flow.onSelectionChange}
          onPaneClick={flow.onPaneClick}
          isValidConnection={flow.isValidConnection}
          nodeTypes={flow.nodeTypes}
          edgeTypes={flow.edgeTypes}
          fitView={flow.reactFlowFitView}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} />
          <Controls />
        </ReactFlow>
        <FlowSidebarOverlay
          data={sidebar.data}
          actions={sidebar.actions}
          presentation={sidebar.presentation}
        />
        <GraphCreateNormaleCollectionModal
          open={graphModals.normale.open}
          busy={graphModals.normale.busy}
          error={graphModals.normale.error}
          tagOptions={graphModals.normale.tagOptions}
          onClose={graphModals.normale.onClose}
          onSubmit={graphModals.normale.onSubmit}
        />
        <CreatePersonnaliteModal
          open={graphModals.personnalite.open}
          busy={graphModals.personnalite.busy}
          error={graphModals.personnalite.error}
          tagOptions={graphModals.personnalite.tagOptions}
          onClose={graphModals.personnalite.onClose}
          onSubmit={graphModals.personnalite.onSubmit}
        />
        <NodeViewLlmImportModal
          open={llmImportModal.open}
          collectionId={llmImportModal.collectionId}
          collections={llmImportModal.collections}
          questions={llmImportModal.questions}
          questionsLoading={llmImportModal.questionsLoading}
          questionsError={llmImportModal.questionsError}
          onClose={llmImportModal.onClose}
          onImportSuccess={llmImportModal.onImportSuccess}
        />
      </div>
    </div>
    </NodeViewGraphActionsContext.Provider>
  );
}

export function NodeView(props: NodeViewProps = {}) {
  const { actions } = props;

  return (
    <div class={NODE_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain class={NODE_VIEW_STYLES.pageMain}>
        <ReactFlowProvider>
          <NodeViewFlowWorkspace actions={actions} />
        </ReactFlowProvider>
      </PageMain>
    </div>
  );
}
