"use client";

import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

const NAV_BASE = process.env.NEXT_PUBLIC_DOCUSIGN_APPS_BASE || "https://apps-d.docusign.com";

export function MarkdownRender({ source }: { source: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:bg-black/10 [&_pre]:dark:bg-white/10 [&_pre]:p-3 [&_pre]:rounded-md [&_code]:text-[0.9em] [&_table]:text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => (url.startsWith("agreement:") ? url : defaultUrlTransform(url))}
        components={{
          a: ({ href, children, ...rest }) => {
            if (href?.startsWith("agreement:")) {
              const id = href.slice("agreement:".length).trim();
              const url = `${NAV_BASE}/send/navigator/agreements/${encodeURIComponent(id)}`;
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={`Open in Docusign Navigator (id: ${id})`}
                  className="inline-flex items-baseline gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 no-underline text-[0.9em] font-medium"
                >
                  {children}
                  <span className="text-[0.75em] opacity-70 leading-none">↗</span>
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
