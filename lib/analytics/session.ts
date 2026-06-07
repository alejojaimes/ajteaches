import { cookies } from 'next/headers';

const COOKIE_NAME = 'ajt_sid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function getSessionHash(): Promise<string> {
  const store = await cookies();
  let sessionId = store.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    store.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  return sha256(sessionId);
}
