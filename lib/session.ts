import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";

export type DocusignSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  accountId: string;
  baseUri: string;
  userId: string;
  name?: string;
  email?: string;
  playbook?: string;
};

export type AuthFlow = {
  state?: string;
  codeVerifier?: string;
};

export type AppSessionData = Partial<DocusignSession> & { auth?: AuthFlow };
export type AppSession = IronSession<AppSessionData>;

const SESSION_COOKIE = "ds_chat_session";

function sessionPassword(): string {
  const pw = process.env.SESSION_PASSWORD;
  if (!pw || pw.length < 32) {
    throw new Error("SESSION_PASSWORD must be set and at least 32 characters");
  }
  return pw;
}

const baseCookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function sessionOptions(): SessionOptions {
  return {
    cookieName: SESSION_COOKIE,
    password: sessionPassword(),
    ttl: 60 * 60 * 24 * 14,
    cookieOptions: baseCookieOpts,
  };
}

export async function getSession(): Promise<AppSession> {
  const store = await cookies();
  const session = await getIronSession<AppSessionData>(store, sessionOptions());
  return session;
}

export function isAuthenticated(s: AppSession): s is AppSession & DocusignSession {
  return Boolean(s.accessToken && s.refreshToken && s.accountId);
}
