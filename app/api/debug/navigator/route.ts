import { NextResponse } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session";
import { refreshAccessToken } from "@/lib/docusign-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "disabled in production" }, { status: 404 });
  }

  const session = await getSession();
  if (!isAuthenticated(session)) {
    return NextResponse.json({ error: "unauthenticated — sign in first" }, { status: 401 });
  }

  if (session.expiresAt && session.expiresAt - Date.now() < 60_000) {
    try {
      const refreshed = await refreshAccessToken(session.refreshToken);
      session.accessToken = refreshed.access_token;
      session.refreshToken = refreshed.refresh_token;
      session.expiresAt = Date.now() + refreshed.expires_in * 1000;
      await session.save();
    } catch (e) {
      return NextResponse.json(
        { error: "token_refresh_failed", message: e instanceof Error ? e.message : String(e) },
        { status: 401 },
      );
    }
  }

  const navBase = "https://api-d.docusign.com/v1/accounts";
  const accountUrl = `${navBase}/${encodeURIComponent(session.accountId)}/agreements`;
  const probeRes = await fetch(`${accountUrl}?limit=5`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const text = await probeRes.text();
  let parsed: unknown = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }

  return NextResponse.json({
    request: { url: `${accountUrl}?limit=5` },
    session: {
      accountId: session.accountId,
      baseUri: session.baseUri,
      tokenExpiresInSec: session.expiresAt ? Math.round((session.expiresAt - Date.now()) / 1000) : null,
    },
    response: {
      status: probeRes.status,
      ok: probeRes.ok,
      contentType: probeRes.headers.get("content-type"),
      body: parsed ?? text.slice(0, 2000),
    },
  });
}
