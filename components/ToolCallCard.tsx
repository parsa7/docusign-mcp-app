"use client";

import { useState } from "react";

export type ToolCall = {
  type: "mcp_tool_use";
  id: string;
  name: string;
  server_name: string;
  input: unknown;
};

export type ToolResult = {
  type: "mcp_tool_result";
  tool_use_id: string;
  is_error?: boolean;
  content: unknown;
};

function summarizeResult(toolName: string, content: unknown): string | null {
  if (!Array.isArray(content) || content.length === 0) return null;
  const first = content[0] as { type?: string; text?: string };
  if (first.type !== "text" || typeof first.text !== "string") return null;

  let parsed: unknown;
  try { parsed = JSON.parse(first.text); } catch { return null; }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  if (toolName === "getAllAgreements") {
    const total =
      typeof obj.totalCount === "number"
        ? obj.totalCount
        : Array.isArray(obj.agreements)
          ? obj.agreements.length
          : null;
    if (total !== null) {
      const more = obj.hasMore === true ? "+" : "";
      return `${total}${more} agreement${total === 1 ? "" : "s"}`;
    }
  }

  if (toolName === "getAgreementDetails") {
    const title =
      (typeof obj.title === "string" && obj.title) ||
      (typeof obj.file_name === "string" && obj.file_name) ||
      (typeof obj.fileName === "string" && obj.fileName) ||
      (typeof obj.name === "string" && obj.name);
    if (title) {
      const truncated = title.length > 60 ? `${title.slice(0, 57)}…` : title;
      return truncated;
    }
  }

  if (Array.isArray(obj)) return `${obj.length} item${obj.length === 1 ? "" : "s"}`;
  return null;
}

export function ToolCallCard({
  call,
  result,
  inProgress,
}: {
  call: ToolCall;
  result?: ToolResult;
  inProgress: boolean;
}) {
  const [open, setOpen] = useState(false);
  const status = inProgress ? "running" : result?.is_error ? "error" : "ok";
  const statusColor =
    status === "running" ? "text-amber-600 dark:text-amber-400"
    : status === "error" ? "text-red-600 dark:text-red-400"
    : "text-emerald-600 dark:text-emerald-400";
  const statusBg =
    status === "running" ? "bg-amber-100/60 dark:bg-amber-900/20"
    : status === "error" ? "bg-red-100/60 dark:bg-red-900/20"
    : "bg-emerald-100/60 dark:bg-emerald-900/20";

  const summary = result && !result.is_error ? summarizeResult(call.name, result.content) : null;

  return (
    <div className={`rounded-md border border-black/10 dark:border-white/10 ${statusBg} text-xs`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className={`font-mono ${statusColor}`}>
            {status === "running" ? "⏳" : status === "error" ? "✖" : "✓"}
          </span>
          <span className="font-mono">{call.server_name}.{call.name}</span>
          {status === "running" ? <span className="opacity-60">running…</span> : null}
          {summary ? <span className="opacity-70 truncate">→ {summary}</span> : null}
        </span>
        <span className="opacity-50 flex-shrink-0">{open ? "hide" : "details"}</span>
      </button>
      {open ? (
        <div className="px-3 pb-3 space-y-2">
          <div>
            <div className="opacity-60 mb-1">input</div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(call.input, null, 2)}
            </pre>
          </div>
          {result ? (
            <div>
              <div className="opacity-60 mb-1">result</div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(result.content, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
