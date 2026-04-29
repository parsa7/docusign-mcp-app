import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { revokeToken } from "@/lib/docusign-oauth";

export async function POST(_req: NextRequest) {
  const session = await getSession();
  const refresh = session.refreshToken;
  session.destroy();
  if (refresh) {
    await revokeToken(refresh);
  }
  return NextResponse.json({ ok: true });
}
