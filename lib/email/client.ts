import { Resend } from 'resend';

let resend: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? 'AJ Teaches <hello@ajteaches.dev>';
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajteaches.dev';
}
