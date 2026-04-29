import { getSession, isAuthenticated } from "@/lib/session";
import { redirect } from "next/navigation";
import { PlaybookEditor } from "@/components/PlaybookEditor";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!isAuthenticated(session)) redirect("/");
  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
        <div>
          <h1 className="text-base font-semibold">Playbook</h1>
          <p className="text-xs opacity-60">your organization's negotiation playbook (legal.local.md)</p>
        </div>
        <a href="/" className="text-xs underline opacity-70 hover:opacity-100">back to chat</a>
      </header>
      <div className="px-4 py-6">
        <PlaybookEditor initial={session.playbook ?? ""} />
      </div>
    </div>
  );
}
