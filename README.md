# Docusign Navigator Chat

A single-user web app that lets Claude answer questions about your Docusign Navigator agreements via the official Docusign MCP server, with Anthropic's open-source legal skills (`review-contract`, `triage-nda`, `compliance-check`) bundled into the system prompt.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind 4 · `@anthropic-ai/sdk` · `iron-session`
- **Auth:** Docusign OAuth 2.0 Authorization Code Grant + PKCE
- **MCP:** Anthropic Messages API MCP connector (`anthropic-beta: mcp-client-2025-11-20`) calls `https://mcp-d.docusign.com/mcp` on your behalf, with your Docusign access token forwarded per request
- **Hosting target:** Vercel (subdomain `docusign-mcp.parsais.me`), launched from a Squarespace page at `parsais.me/docusign-mcp-app`

## What you need to do (Parsa)

These are the only manual steps. Everything else is in code.

### 1. Docusign developer account

1. Sign up free at <https://developers.docusign.com>.
2. Go to **Apps and Keys** → **Add App and Integration Key**. Pick a name like "Navigator Chat (dev)".
3. In the new app:
   - Auth type: **Authorization Code Grant**.
   - Add redirect URIs:
     - `http://localhost:3000/api/auth/callback/docusign`
     - `https://docusign-mcp.parsais.me/api/auth/callback/docusign` (add later, before deploying)
   - Generate a **Secret Key** and save it.
   - Copy the **Integration Key** (this is your client_id).
4. Seed the demo account with 3-5 agreements: in the Docusign UI, send a few of the demo templates to yourself so they end up signed and indexed by Navigator. Include at least one NDA and one vendor agreement.

### 2. Anthropic API key

1. Sign in / sign up at <https://console.anthropic.com>.
2. Add a payment method. Create an API key. Copy it.

### 3. Local `.env.local`

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
openssl rand -base64 32   # paste output as SESSION_PASSWORD
```

Required values: `ANTHROPIC_API_KEY`, `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_SECRET_KEY`, `SESSION_PASSWORD`. The rest already have sensible defaults for the demo environment.

### 4. Run locally

```bash
npm run dev
```

Open <http://localhost:3000>. Click "Sign in with Docusign", grant consent, and you're in chat. Try:

- *List my agreements*
- *Find all NDAs*
- *Which agreements expire in the next 90 days?*
- `/triage-nda <agreement name or id>`
- `/review-contract <agreement name or id>`

### 5. Deploy to Vercel

1. Push this directory to a new private GitHub repo.
2. In <https://vercel.com>, click **Import**, select the repo. Defaults are fine.
3. In **Project Settings → Environment Variables**, add every value from your `.env.local` *except* `DOCUSIGN_REDIRECT_URI`. For that one, set:
   ```
   DOCUSIGN_REDIRECT_URI=https://docusign-mcp.parsais.me/api/auth/callback/docusign
   ```
4. **Domains** tab → add `docusign-mcp.parsais.me`. Vercel will show a CNAME target like `cname.vercel-dns.com`.
5. In **Squarespace → Settings → Domains → Advanced DNS**, add a CNAME record:
   - Host: `docusign-mcp`
   - Points to: `cname.vercel-dns.com` (use the exact value Vercel shows)
6. Wait ~5 min for DNS to propagate, then visit <https://docusign-mcp.parsais.me>.
7. Update the Docusign app with the production redirect URI (you already added it in step 1.3 if you followed along).

### 6. Squarespace launcher

In Squarespace, create (or edit) a page at `/docusign-mcp-app`. Add a button block linking to `https://docusign-mcp.parsais.me/`. Done.

---

## How it works (under the hood)

- **OAuth.** `app/api/auth/login/route.ts` builds the Docusign authorize URL with PKCE and a state cookie. `app/api/auth/callback/docusign/route.ts` exchanges the code, fetches `/oauth/userinfo`, and seals tokens into the iron-session cookie.
- **Chat.** `app/api/chat/route.ts` reads the session, refreshes the Docusign token if it's about to expire, picks a model based on slash-command intent (`lib/intent-router.ts`), composes the system prompt with the three vendored legal skills (`lib/system-prompt.ts`), and streams from `client.beta.messages.stream(...)` with the MCP connector pointed at the Docusign MCP server.
- **MCP allowlist.** `lib/anthropic.ts` only enables the five Navigator read tools (`auth_status`, `get_agreements`, `list_agreements`, `get_agreement_by_id`, `search_agreements`). Even if the server exposes write tools, the toolset's `default_config: { enabled: false }` keeps them off.
- **Streaming UI.** `components/Chat.tsx` consumes the SSE event stream, renders text deltas as markdown, and shows MCP tool calls as inline cards (`ToolCallCard.tsx`).
- **Skills.** `scripts/fetch-skills.ts` runs in `predev` / `prebuild` and downloads three `SKILL.md` files from `anthropics/knowledge-work-plugins` (Apache 2.0; attribution in `THIRD_PARTY_NOTICES.md`). Pin a commit SHA via `SKILLS_PIN_SHA` for reproducible builds.
- **Playbook.** `/settings` lets you paste your organization's negotiation playbook. It's stored in the sealed session cookie and appended to the system prompt on every request, where Claude is instructed to prefer it over the generic skill defaults.
- **Security.** `next.config.ts` sets HSTS / CSP / X-Frame-Options. `lib/rate-limit.ts` puts a 30 req/min ceiling on `/api/chat`. The chat route 401s if the session is missing.

## Project layout

```
app/
  page.tsx                       chat (gated)
  settings/page.tsx              playbook editor
  api/
    auth/{login,callback,logout,me}/route.ts
    chat/route.ts                streaming SSE → Anthropic + MCP
    playbook/route.ts            GET/PUT user playbook
components/
  Chat.tsx, ConnectDocusign.tsx, MarkdownRender.tsx,
  ToolCallCard.tsx, PlaybookEditor.tsx
lib/
  anthropic.ts                   SDK + MCP server/toolset builders
  docusign-oauth.ts              Authorization Code Grant + PKCE
  session.ts                     iron-session config
  intent-router.ts               slash-command → model routing
  system-prompt.ts               base prompt + skill files (cache-marked)
  rate-limit.ts                  in-memory IP / user rate limiter
  skills/                        vendored at build time
scripts/
  fetch-skills.ts                downloader from anthropics/knowledge-work-plugins
```

## Known limitations / out of scope

- **Read-only.** No envelope creation, sending, signing, or modification.
- **Single user.** No team / multi-tenant. Cookie holds tokens for the one logged-in user.
- **Demo Docusign only.** Production MCP server requires beta enrollment.
- **No persistent chat history.** Conversations live in browser state for the session.
- **Three skills only:** `review-contract`, `triage-nda`, `compliance-check`. The other Anthropic legal skills (`canned-responses`, `legal-risk-assessment`, `meeting-briefing`) are not wired in.

## Plan B if the MCP connector misbehaves

If `authorization_token` doesn't propagate to the Docusign MCP server, fall back to running an in-process MCP client. Install `@modelcontextprotocol/sdk`, open a Streamable HTTP transport to `mcp-d.docusign.com/mcp` from `app/api/chat/route.ts`, and register the discovered tools via the SDK's standard `tools` parameter instead of the `mcp_servers` block. The user-facing UX is the same; we just proxy tool calls through Vercel.

## Third-party content

The skill files in `lib/skills/` are vendored from [`anthropics/knowledge-work-plugins`](https://github.com/anthropics/knowledge-work-plugins) under the Apache License 2.0. See `THIRD_PARTY_NOTICES.md`.
