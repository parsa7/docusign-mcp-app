import { NextResponse } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session";
import { fetchUserInfo, refreshAccessToken } from "@/lib/docusign-oauth";

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

  const info = await fetchUserInfo(session.accessToken);

  const probes = await Promise.all(
    info.accounts.map(async (a) => {
      const url = `https://api-d.docusign.com/v1/accounts/${encodeURIComponent(a.account_id)}/agreements?limit=1`;
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const text = await res.text();
        let parsed: { totalCount?: number; agreements?: unknown[] } | null = null;
        try { parsed = JSON.parse(text); } catch { parsed = null; }
        return {
          accountId: a.account_id,
          accountName: a.account_name,
          isDefault: a.is_default,
          baseUri: a.base_uri,
          status: res.status,
          totalAgreements: parsed?.totalCount ?? null,
          firstSampleAgreementCount: parsed?.agreements?.length ?? 0,
          rawSnippet: parsed ? null : text.slice(0, 200),
        };
      } catch (e) {
        return {
          accountId: a.account_id,
          accountName: a.account_name,
          isDefault: a.is_default,
          baseUri: a.base_uri,
          status: 0,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    }),
  );

  return NextResponse.json({
    sessionAccountId: session.accountId,
    userInfo: { sub: info.sub, name: info.name, email: info.email },
    accounts: probes,
  });
}
