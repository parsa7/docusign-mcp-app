"use client";

import { useState } from "react";

const PLACEHOLDER = `# Playbook example
## Limitation of Liability
- Standard: cap at 12 months fees
- Acceptable range: 6-24 months fees
- Escalate if: uncapped, or excludes IP indemnity carve-outs

## Indemnification
- Standard: mutual indemnity for IP and confidentiality
- Escalate if: one-sided, or includes consequential damages

## Term & Termination
- Standard: 12-month initial, auto-renew with 60-day notice
- Escalate if: > 36-month initial term, or no termination for convenience
`;

export function PlaybookEditor({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function save() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/playbook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbook: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `http ${res.status}`);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm opacity-70">
        This text is appended to the system prompt on every chat request. Claude prefers your instructions
        here over generic skill defaults when they conflict.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={PLACEHOLDER}
        className="w-full min-h-[480px] rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-black/40 dark:focus:border-white/40"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50"
        >
          {status === "saving" ? "saving…" : "save playbook"}
        </button>
        {status === "saved" ? <span className="text-xs text-emerald-600 dark:text-emerald-400">saved</span> : null}
        {status === "error" ? <span className="text-xs text-red-600 dark:text-red-400">error: {errorMsg}</span> : null}
        <span className="text-xs opacity-50 ml-auto">{value.length.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
