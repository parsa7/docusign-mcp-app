import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession, isAuthenticated } from "@/lib/session";
import { refreshAccessToken } from "@/lib/docusign-oauth";
import { getAnthropic, buildMcpServers, buildMcpToolset, MCP_BETA } from "@/lib/anthropic";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { pickRoute } from "@/lib/intent-router";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Message = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
const Body = z.object({ messages: z.array(Message).min(1).max(40) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const rate = checkRateLimit(`chat:${session.userId ?? clientKey(req)}`, 30, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { messages } = parsed.data;

  if (session.expiresAt && session.expiresAt - Date.now() < 60_000) {
    try {
      const refreshed = await refreshAccessToken(session.refreshToken);
      session.accessToken = refreshed.access_token;
      session.refreshToken = refreshed.refresh_token;
      session.expiresAt = Date.now() + refreshed.expires_in * 1000;
      await session.save();
    } catch (e) {
      return NextResponse.json({ error: "token_refresh_failed" }, { status: 401 });
    }
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const route = pickRoute(lastUser?.content ?? "");
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
  if (route.expandPrompt && lastUser) {
    apiMessages[apiMessages.length - 1] = {
      role: "user",
      content: `${lastUser.content}\n\n[directive]: ${route.expandPrompt}`,
    };
  }

  const client = getAnthropic();
  const stream = client.beta.messages.stream({
    model: route.model,
    max_tokens: 4096,
    system: buildSystemPrompt({
      accountId: session.accountId,
      userName: session.name,
      userEmail: session.email,
      playbook: session.playbook,
    }),
    messages: apiMessages,
    mcp_servers: buildMcpServers(session.accessToken),
    tools: buildMcpToolset() as never,
    betas: [MCP_BETA],
  });

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const debug = process.env.NODE_ENV !== "production";
      try {
        for await (const event of stream) {
          if (debug) {
            const ev = event as { type: string; content_block?: { type?: string; name?: string } };
            if (ev.type === "content_block_start" && ev.content_block) {
              console.log(`[chat] block_start type=${ev.content_block.type} name=${ev.content_block.name ?? ""}`);
            } else if (ev.type === "message_start" || ev.type === "message_stop") {
              console.log(`[chat] ${ev.type}`);
            }
          }
          send(event.type, event);
        }
        const final = await stream.finalMessage();
        if (debug) {
          console.log(`[chat] final stop_reason=${final.stop_reason} blocks=${final.content.length}`);
          for (const b of final.content) {
            const block = b as { type: string; name?: string; server_name?: string };
            console.log(`[chat]   block type=${block.type} name=${block.name ?? ""} server=${block.server_name ?? ""}`);
          }
        }
        send("final", { usage: final.usage, stop_reason: final.stop_reason, model: final.model });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (debug) console.error("[chat] stream error:", err);
        send("server_error", { message: message.slice(0, 500) });
      } finally {
        send("done", {});
        controller.close();
      }
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(sse, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
