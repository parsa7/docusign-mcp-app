import { NextResponse } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    name: session.name ?? null,
    email: session.email ?? null,
    accountId: session.accountId,
  });
}
