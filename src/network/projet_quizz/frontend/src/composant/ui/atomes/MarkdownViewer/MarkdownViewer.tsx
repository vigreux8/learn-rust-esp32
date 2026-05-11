import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { MARKDOWN_VIEWER_STYLES } from "./MarkdownViewer.styles";
import type { MarkdownViewerProps } from "./MarkdownViewer.types";
import { useMarkdownViewer } from "./MarkdownViewer.hook";

export function MarkdownViewer(props: MarkdownViewerProps) {
  const { display } = useMarkdownViewer(props);

  return (
    <div class={MARKDOWN_VIEWER_STYLES.container}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {display.content}
      </ReactMarkdown>
    </div>
  );
}
