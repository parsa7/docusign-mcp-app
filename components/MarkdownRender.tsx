"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRender({ source }: { source: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-black/10 [&_pre]:dark:bg-white/10 [&_pre]:p-3 [&_pre]:rounded-md [&_code]:text-[0.9em] [&_table]:text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
              {children}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
