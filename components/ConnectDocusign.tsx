export function ConnectDocusign({ error }: { error?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 p-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-2xl font-semibold">Docusign Navigator Chat</h1>
        <p className="text-sm opacity-70">
          Sign in with your Docusign developer account to ask Claude about your agreements. Read-only:
          Claude can search, read, and analyze, but cannot create, modify, or send agreements.
        </p>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-100/40 dark:bg-red-900/20 rounded-md p-2">
            {error}
          </p>
        ) : null}
      </div>
      <a
        href="/api/auth/login"
        className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
      >
        Sign in with Docusign
      </a>
      <p className="text-xs opacity-50 max-w-md">
        You will be redirected to account-d.docusign.com to grant this app read access to your Navigator
        agreements (scope: <code>adm_store_unified_repo_read</code>).
      </p>
    </div>
  );
}
