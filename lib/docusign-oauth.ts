import { createHash, randomBytes } from "node:crypto";

function authBase(): string {
  return process.env.DOCUSIGN_AUTH_BASE || "https://account-d.docusign.com";
}

function clientId(): string {
  const v = process.env.DOCUSIGN_INTEGRATION_KEY;
  if (!v) throw new Error("DOCUSIGN_INTEGRATION_KEY is not set");
  return v;
}

function clientSecret(): string {
  const v = process.env.DOCUSIGN_SECRET_KEY;
  if (!v) throw new Error("DOCUSIGN_SECRET_KEY is not set");
  return v;
}

function redirectUri(): string {
  const v = process.env.DOCUSIGN_REDIRECT_URI;
  if (!v) throw new Error("DOCUSIGN_REDIRECT_URI is not set");
  return v;
}

function scopes(): string {
  return process.env.DOCUSIGN_SCOPES || "signature adm_store_unified_repo_read openid";
}

function basicAuth(): string {
  return Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64");
}

export type PkcePair = { codeVerifier: string; codeChallenge: string };

export function generatePkce(): PkcePair {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return randomBytes(16).toString("base64url");
}

export function buildAuthUrl(state: string, codeChallenge: string): string {
  const u = new URL(`${authBase()}/oauth/auth`);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", scopes());
  u.searchParams.set("client_id", clientId());
  u.searchParams.set("redirect_uri", redirectUri());
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

export type TokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
};

export type UserInfo = {
  sub: string;
  name?: string;
  email?: string;
  accounts: Array<{
    account_id: string;
    is_default: boolean;
    account_name?: string;
    base_uri: string;
  }>;
};

export async function exchangeCode(code: string, codeVerifier: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
    code_verifier: codeVerifier,
  });
  const res = await fetch(`${authBase()}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Docusign token exchange failed: ${res.status} ${errText.slice(0, 300)}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(`${authBase()}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Docusign token refresh failed: ${res.status} ${errText.slice(0, 300)}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch(`${authBase()}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Docusign userinfo failed: ${res.status}`);
  return (await res.json()) as UserInfo;
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`${authBase()}/oauth/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ token }),
  }).catch(() => {});
}
