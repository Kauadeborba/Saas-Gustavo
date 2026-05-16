import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'technote_admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type SessionUser = {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'operador';
};

export type AuthSession = SessionUser & {
  exp: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dev-session-secret';
}

function signPayload(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createSessionToken(user: SessionUser) {
  const session: AuthSession = {
    ...user,
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const payload = toBase64Url(JSON.stringify(session));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as AuthSession;

    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
