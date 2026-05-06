import type { MarkdownViewerProps } from "./MarkdownViewer.types";

export function useMarkdownViewer(props: MarkdownViewerProps) {
  const { data } = props;

  return {
    display: {
      content: data.content,
    },
  };
}
