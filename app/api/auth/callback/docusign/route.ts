import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, fetchUserInfo } from "@/lib/docusign-oauth";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errParam = url.searchParams.get("error");
  const errDesc = url.searchParams.get("error_description");

  const session = await getSession();
  const auth = session.auth;
  session.auth = undefined;

  if (errParam) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(errDesc || errParam)}`, req.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/?auth_error=missing_code_or_state", req.url));
  }
  if (!auth?.state || !auth?.codeVerifier || auth.state !== state) {
    return NextResponse.redirect(new URL("/?auth_error=state_mismatch", req.url));
  }

  try {
    const tokens = await exchangeCode(code, auth.codeVerifier);
    const info = await fetchUserInfo(tokens.access_token);
    const account = info.accounts.find((a) => a.is_default) || info.accounts[0];
    if (!account) {
      return NextResponse.redirect(new URL("/?auth_error=no_accounts", req.url));
    }

    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.expiresAt = Date.now() + tokens.expires_in * 1000;
    session.accountId = account.account_id;
    session.baseUri = account.base_uri;
    session.userId = info.sub;
    session.name = info.name;
    session.email = info.email;
    await session.save();

    return NextResponse.redirect(new URL("/", req.url));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(msg.slice(0, 200))}`, req.url));
  }
}
