import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { AppHeader } from "../../ui/atomes/AppHeader/AppHeader";
import { PageMain } from "../../ui/atomes/PageMain/PageMain";
import { FlowSidebarOverlay } from "../../ui/organismes/FlowSidebarOverlay";
import { useNodeViewFlow } from "./NodeView.hook";
import { NODE_VIEW_STYLES } from "./NodeView.styles";
import type { NodeViewProps } from "./NodeView.types";

/**
 * Zone graphe + sidebar : doit vivre sous `ReactFlowProvider` pour `useReactFlow` dans le hook.
 */
function NodeViewFlowWorkspace(props: Pick<NodeViewProps, "actions">) {
  const { flow, sidebar } = useNodeViewFlow({ actions: props.actions });

  return (
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
          nodeTypes={flow.nodeTypes}
          edgeTypes={flow.edgeTypes}
          fitView
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
      </div>
    </div>
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
