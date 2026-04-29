import { NextResponse, type NextRequest } from "next/server";
import { buildAuthUrl, generatePkce, generateState } from "@/lib/docusign-oauth";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  const state = generateState();
  const { codeVerifier, codeChallenge } = generatePkce();

  session.auth = { state, codeVerifier };
  await session.save();

  const url = buildAuthUrl(state, codeChallenge);
  return NextResponse.redirect(url);
}
