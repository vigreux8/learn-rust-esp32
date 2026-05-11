/** Props de page : réservé pour évolution routeur (comme `HomeView`). */
export type NodeViewProps = {
  route?: Record<string, never>;
  actions?: {
    onNodeCreate?: (type: string, position: { x: number; y: number }, data: unknown) => void;
  };
};
