# Docusign Navigator Chat

A chat interface to your Docusign Navigator agreement repository, powered by Claude and the Anthropic Messages API's MCP connector.

Ask natural-language questions about your executed agreements — *"which NDAs expire in the next 90 days?"*, *"find all auto-renewing contracts"*, *"summarize the indemnification clauses across my vendor agreements"* — and Claude calls Docusign's MCP server on your behalf, filters and reasons over the results, and replies with citations linking back to Navigator.

Includes slash-commands that apply Anthropic's open-source legal skills (`review-contract`, `triage-nda`, `compliance-check`) for clause-by-clause analysis against a user-supplied playbook.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 |
| LLM | `@anthropic-ai/sdk` — `client.beta.messages.stream` with `mcp-client-2025-11-20` beta header |
| MCP server | Docusign MCP server, demo: `https://mcp-d.docusign.com/mcp` |
| Auth | Docusign OAuth 2.0 — Authorization Code Grant + PKCE |
| Session | `iron-session` (encrypted cookie; no DB) |
| Streaming | Server-Sent Events from a Next.js Route Handler, consumed by a custom React client |
| Deploy target | Any Node-runtime PaaS (Vercel works out of the box) |

## How it works

```
Browser ──► Next.js Route Handler (/api/chat)
              │
              ├──► Anthropic Messages API (with mcp_servers + mcp_toolset)
              │       │
              │       └──► Docusign MCP server (auth via per-request bearer token)
              │               │
              │               └──► Docusign Navigator API
              │
              └──► SSE stream of events back to browser
```

The Anthropic MCP connector handles the actual MCP protocol — tool discovery, tool calls, and result streaming — using the Docusign access token that the user obtained via the app's OAuth flow. Tokens are passed per request (`authorization_token` field on the server definition); they never leave the user's session and are never logged.

The toolset is locked to Docusign Navigator's two read-only tools (`getAllAgreements`, `getAgreementDetails`) via an explicit allowlist. Even if the MCP server exposes write tools (eSignature, Maestro), they cannot be invoked from this app.

The system prompt bundles three open-source legal skills from [`anthropics/knowledge-work-plugins`](https://github.com/anthropics/knowledge-work-plugins) (Apache 2.0). Skill content is vendored at build time and pinned to a commit SHA for reproducibility. The user-supplied playbook (configured in `/settings`) is appended after the skills so it can override defaults.

## Local development

Requires Node 20.9+ and a Docusign developer account ([free signup](https://developers.docusign.com)).

```bash
git clone <this repo>
cd docusign-mcp-app
npm install
cp .env.example .env.local
# fill in the four required values in .env.local — see below
npm run dev
```

Open <http://localhost:3000>, click "Sign in with Docusign", complete consent. The chat UI appears once authenticated.

### Required environment variables

Generate a session password with `openssl rand -base64 32`. Get the Anthropic API key from <https://console.anthropic.com>. Get the Docusign Integration Key + Secret from your developer account's Apps and Keys page (use Authorization Code Grant; register `http://localhost:3000/api/auth/callback/docusign` as a redirect URI).

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Authenticates this app to the Anthropic API |
| `DOCUSIGN_INTEGRATION_KEY` | OAuth client_id for the Docusign integration |
| `DOCUSIGN_SECRET_KEY` | OAuth client_secret |
| `SESSION_PASSWORD` | 32+ character random string; encrypts the session cookie |

The remaining variables in `.env.example` have working demo defaults.

### Sample data

A script generates 10 fictional sample agreements as PDFs:

```bash
npm run generate:samples
```

Output goes to `samples/`. Upload them to your demo Navigator account (or sign through eSignature self-sign — agreements auto-flow into Navigator on signature).

## Deployment

The app deploys to any Node-runtime PaaS. For Vercel:

1. Push the repo to GitHub and import it into Vercel.
2. Set every variable from `.env.example` as a project environment variable (use a *new* `SESSION_PASSWORD` for production — don't reuse the local one).
3. Set `DOCUSIGN_REDIRECT_URI` to `https://<your-deployed-host>/api/auth/callback/docusign`.
4. Add the same redirect URI to your Docusign integration's allowed list.
5. Optionally, add a custom domain via `Settings → Domains` and a CNAME record pointing to Vercel.

For production-tier Docusign accounts, the official MCP server requires beta enrollment — contact Docusign for access. In the meantime, the demo MCP server (`mcp-d.docusign.com`) and demo OAuth host (`account-d.docusign.com`) are open.

## Project structure

```
app/
  page.tsx                       chat UI, gated on session
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
  fetch-skills.ts                downloads SKILL.md files at build time
  generate-sample-agreements.ts  produces 10 sample PDFs
```

## Security posture

- OAuth uses Authorization Code Grant with PKCE; state cookie defends against CSRF on the callback.
- Session cookies are AES-encrypted via `iron-session`. Refresh tokens are stored inside the sealed cookie; no separate persistence layer.
- The chat route gates on session and applies a per-user rate limit (30 req/min, in-memory).
- A strict CSP is set in production (`script-src 'self' 'unsafe-inline'`); development relaxes it for HMR / fast-refresh.
- The MCP toolset allowlist enforces read-only access — only `getAllAgreements` and `getAgreementDetails` are enabled even though the access token has `signature` scope.
- Markdown is rendered through `react-markdown` with default sanitization; no `dangerouslySetInnerHTML`.

## Out of scope

- Agreement creation, modification, sending, or signing (read-only by design)
- Multi-tenant / team workspaces
- Persistent chat history beyond the current browser session
- Embeddings / RAG over agreement bodies (relies on Navigator's structured AI extraction)

## Acknowledgments

- The legal skills vendored under `lib/skills/` are sourced from [`anthropics/knowledge-work-plugins`](https://github.com/anthropics/knowledge-work-plugins) and used under the Apache License 2.0. See `THIRD_PARTY_NOTICES.md` for attribution.
- Built on top of Docusign's [MCP server beta](https://developers.docusign.com/platform/mcp-server/) and [Navigator API](https://developers.docusign.com/docs/navigator-api/).
