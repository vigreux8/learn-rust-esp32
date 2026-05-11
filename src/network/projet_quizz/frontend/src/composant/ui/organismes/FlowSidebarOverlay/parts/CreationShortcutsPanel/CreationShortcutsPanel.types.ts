export type CreationShortcutsPanelProps = {
  actions: {
    onDragStart: (event: DragEvent, nodeType: string, payload: unknown) => void;
  };
};
