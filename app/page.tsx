import { getSession, isAuthenticated } from "@/lib/session";
import { Chat } from "@/components/Chat";
import { ConnectDocusign } from "@/components/ConnectDocusign";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  if (!isAuthenticated(session)) {
    return <ConnectDocusign error={params.auth_error ?? null} />;
  }
  return <Chat user={{ name: session.name ?? null, email: session.email ?? null }} />;
}
