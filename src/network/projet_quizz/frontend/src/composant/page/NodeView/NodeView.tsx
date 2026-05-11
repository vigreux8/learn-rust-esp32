import { Background, Controls, ReactFlow } from "@xyflow/react";
import { AppHeader } from "../../ui/atomes/AppHeader/AppHeader";
import { PageMain } from "../../ui/atomes/PageMain/PageMain";
import { useNodeViewFlow } from "./NodeView.hook";
import { NODE_VIEW_STYLES } from "./NodeView.styles";
import type { NodeViewProps } from "./NodeView.types";

export function NodeView(_props: NodeViewProps = {}) {
  const { flow } = useNodeViewFlow();

  return (
    <div class={NODE_VIEW_STYLES.root}>
      <AppHeader />
      <PageMain class={NODE_VIEW_STYLES.pageMain}>
        <div class={NODE_VIEW_STYLES.flowShell}>
          <div class={NODE_VIEW_STYLES.canvasInner}>
            <ReactFlow
              className="h-full w-full"
              nodes={flow.nodes}
              edges={flow.edges}
              onNodesChange={flow.onNodesChange}
              onEdgesChange={flow.onEdgesChange}
              onConnect={flow.onConnect}
              nodeTypes={flow.nodeTypes}
              edgeTypes={flow.edgeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={16} />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </PageMain>
    </div>
  );
}
