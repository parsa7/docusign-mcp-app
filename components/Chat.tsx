"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownRender } from "./MarkdownRender";
import { ToolCallCard, type ToolCall, type ToolResult } from "./ToolCallCard";

type TextBlock = { kind: "text"; text: string };
type ToolUseBlock = { kind: "tool_use"; data: ToolCall };
type ToolResultBlock = { kind: "tool_result"; data: ToolResult };
type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

type Msg = {
  id: string;
  role: "user" | "assistant" | "system";
  blocks: ContentBlock[];
  meta?: { model?: string; cacheRead?: number; cacheCreated?: number; inputTokens?: number; outputTokens?: number };
  error?: string;
};

const SUGGESTIONS = [
  "List my agreements",
  "Find all NDAs with Acme Corp",
  "Which agreements expire in the next 90 days?",
  "/triage-nda <agreement-name-or-id>",
  "/review-contract <agreement-name-or-id>",
  "Show the raw JSON of one agreement from getAllAgreements",
  "Which contracts auto-renew, and when's each renewal-decision deadline?",
  "Which agreements have a ParsaFee value set, and what are the amounts?",
  "/vendor-check Acme Corp",
];

function newId() {
  return Math.random().toString(36).slice(2);
}

export function Chat({ user }: { user: { name?: string | null; email?: string | null } }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [messages]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    const userMsg: Msg = { id: newId(), role: "user", blocks: [{ kind: "text", text: trimmed }] };
    const asstMsg: Msg = { id: newId(), role: "assistant", blocks: [] };
    setMessages((prev) => [...prev, userMsg, asstMsg]);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const apiPayload = {
      messages: [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.blocks
          .filter((b): b is TextBlock => b.kind === "text")
          .map((b) => b.text)
          .join(""),
      })),
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({ error: `http ${res.status}` }));
        const errText = errBody.error ?? `http ${res.status}`;
        setMessages((prev) =>
          prev.map((m) => (m.id === asstMsg.id ? { ...m, error: errText } : m)),
        );
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() ?? "";
        for (const ev of events) {
          if (!ev.trim()) continue;
          let eventName = "";
          let dataLine = "";
          for (const line of ev.split("\n")) {
            if (line.startsWith("event: ")) eventName = line.slice(7).trim();
            else if (line.startsWith("data: ")) dataLine = line.slice(6);
          }
          if (!eventName || !dataLine) continue;
          const data = JSON.parse(dataLine);
          setMessages((prev) =>
            prev.map((m) => (m.id === asstMsg.id ? applyEvent(m, eventName, data) : m)),
          );
        }
      }
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      const errText = e instanceof Error ? e.message : String(e);
      setMessages((prev) =>
        prev.map((m) => (m.id === asstMsg.id ? { ...m, error: errText } : m)),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, streaming]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const onLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }, []);

  const userLabel = useMemo(() => {
    return user.name || user.email || "signed in";
  }, [user]);

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
        <div>
          <h1 className="text-base font-semibold">Docusign Navigator Chat</h1>
          <p className="text-xs opacity-60">read-only · sandbox</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <a href="/settings" className="underline opacity-70 hover:opacity-100">playbook</a>
          <span className="opacity-60">{userLabel}</span>
          <button onClick={onLogout} className="underline opacity-70 hover:opacity-100 cursor-pointer">
            sign out
          </button>
        </div>
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-sm space-y-3">
            <p className="opacity-70">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="text-xs rounded-full border border-black/10 dark:border-white/10 px-3 py-1 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  onClick={() => setInput(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, idx) => (
          <MessageView key={m.id} msg={m} streaming={streaming} isLast={idx === messages.length - 1} />
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (streaming) stop();
          else send();
        }}
        className="border-t border-black/10 dark:border-white/10 p-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your agreements…"
          className="flex-1 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:focus:border-white/40"
          disabled={streaming}
        />
        <button
          type="submit"
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50"
          disabled={!streaming && input.trim().length === 0}
        >
          {streaming ? "stop" : "send"}
        </button>
      </form>
    </div>
  );
}

function MessageView({ msg, streaming, isLast }: { msg: Msg; streaming: boolean; isLast: boolean }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-black/5 dark:bg-white/10 px-4 py-2 text-sm whitespace-pre-wrap">
          {msg.blocks.map((b, i) => (b.kind === "text" ? <span key={i}>{b.text}</span> : null))}
        </div>
      </div>
    );
  }
  const showActiveIndicator = streaming && isLast;
  const indicator = activeIndicatorLabel(msg, streaming, isLast);
  return (
    <div className="space-y-2">
      {msg.blocks.map((b, i) => {
        if (b.kind === "text") return <MarkdownRender key={i} source={b.text} />;
        if (b.kind === "tool_use") {
          const result = findResult(msg.blocks, b.data.id);
          return (
            <ToolCallCard
              key={i}
              call={b.data}
              result={result}
              inProgress={!result}
            />
          );
        }
        return null;
      })}
      {showActiveIndicator && indicator ? (
        <div className="text-xs opacity-60 italic flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse" />
          {indicator}
        </div>
      ) : null}
      {msg.error ? (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-100/40 dark:bg-red-900/20 rounded-md p-2">
          {msg.error}
        </div>
      ) : null}
      {msg.meta ? (
        <div className="text-[10px] opacity-50 font-mono">
          {msg.meta.model ?? ""} · in {msg.meta.inputTokens ?? "?"} / out {msg.meta.outputTokens ?? "?"}
          {msg.meta.cacheRead ? ` · cache-hit ${msg.meta.cacheRead}` : ""}
          {msg.meta.cacheCreated ? ` · cache-write ${msg.meta.cacheCreated}` : ""}
        </div>
      ) : null}
    </div>
  );
}

function activeIndicatorLabel(msg: Msg, streaming: boolean, isLast: boolean): string | null {
  if (!streaming || !isLast) return null;
  if (msg.blocks.length === 0) return "thinking…";
  const last = msg.blocks[msg.blocks.length - 1];
  if (last.kind === "tool_use") {
    const hasResult = msg.blocks.some(
      (b) => b.kind === "tool_result" && b.data.tool_use_id === last.data.id,
    );
    return hasResult ? "thinking…" : `running ${last.data.server_name}.${last.data.name}…`;
  }
  if (last.kind === "tool_result") return "thinking…";
  return "writing…";
}

function findResult(blocks: ContentBlock[], toolUseId: string): ToolResult | undefined {
  for (const b of blocks) if (b.kind === "tool_result" && b.data.tool_use_id === toolUseId) return b.data;
  return undefined;
}

function applyEvent(msg: Msg, eventName: string, data: unknown): Msg {
  const blocks = [...msg.blocks];
  const ev = data as Record<string, unknown>;

  switch (eventName) {
    case "content_block_start": {
      const idx = ev.index as number;
      const block = ev.content_block as Record<string, unknown>;
      if (block.type === "text") {
        blocks[idx] = { kind: "text", text: (block.text as string) || "" };
      } else if (block.type === "mcp_tool_use") {
        blocks[idx] = {
          kind: "tool_use",
          data: {
            type: "mcp_tool_use",
            id: block.id as string,
            name: block.name as string,
            server_name: block.server_name as string,
            input: block.input ?? {},
          },
        };
      } else if (block.type === "mcp_tool_result") {
        blocks[idx] = {
          kind: "tool_result",
          data: {
            type: "mcp_tool_result",
            tool_use_id: block.tool_use_id as string,
            is_error: block.is_error as boolean | undefined,
            content: block.content,
          },
        };
      } else if (block.type === "tool_use") {
        // ignore non-MCP tool use for now
      }
      return { ...msg, blocks };
    }
    case "content_block_delta": {
      const idx = ev.index as number;
      const delta = ev.delta as Record<string, unknown>;
      const target = blocks[idx];
      if (!target) return msg;
      if (delta.type === "text_delta" && target.kind === "text") {
        blocks[idx] = { kind: "text", text: target.text + (delta.text as string) };
      } else if (delta.type === "input_json_delta" && target.kind === "tool_use") {
        // We don't strictly need to parse this — the final input is applied at content_block_stop.
      }
      return { ...msg, blocks };
    }
    case "content_block_stop": {
      // No-op — final block content was set on _start (and updated by deltas for text).
      return msg;
    }
    case "message_start": {
      const m = ev.message as Record<string, unknown>;
      return { ...msg, meta: { ...msg.meta, model: m.model as string } };
    }
    case "message_delta": {
      const usage = ev.usage as Record<string, number> | undefined;
      if (!usage) return msg;
      return {
        ...msg,
        meta: {
          ...msg.meta,
          inputTokens: usage.input_tokens ?? msg.meta?.inputTokens,
          outputTokens: usage.output_tokens ?? msg.meta?.outputTokens,
          cacheRead: usage.cache_read_input_tokens ?? msg.meta?.cacheRead,
          cacheCreated: usage.cache_creation_input_tokens ?? msg.meta?.cacheCreated,
        },
      };
    }
    case "final": {
      const usage = ev.usage as Record<string, number> | undefined;
      return {
        ...msg,
        meta: {
          ...msg.meta,
          model: (ev.model as string) ?? msg.meta?.model,
          inputTokens: usage?.input_tokens ?? msg.meta?.inputTokens,
          outputTokens: usage?.output_tokens ?? msg.meta?.outputTokens,
          cacheRead: usage?.cache_read_input_tokens ?? msg.meta?.cacheRead,
          cacheCreated: usage?.cache_creation_input_tokens ?? msg.meta?.cacheCreated,
        },
      };
    }
    case "server_error": {
      const m = (ev.message as string) || "stream error";
      return { ...msg, error: m };
    }
    default:
      return msg;
  }
}
