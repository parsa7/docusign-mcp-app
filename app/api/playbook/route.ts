import { NextResponse, type NextRequest } from "next/server";
import { getSession, isAuthenticated } from "@/lib/session";
import { z } from "zod";

const PlaybookBody = z.object({ playbook: z.string().max(50_000) });

export async function GET() {
  const session = await getSession();
  if (!isAuthenticated(session)) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json({ playbook: session.playbook ?? "" });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!isAuthenticated(session)) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = PlaybookBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  session.playbook = parsed.data.playbook;
  await session.save();
  return NextResponse.json({ ok: true });
}
