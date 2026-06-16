'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { getResendClient, getFromEmail } from '@/lib/email/client';
import { renderAdminMessageEmail } from '@/lib/email/templates/admin-message';
import { renderNewsletterOptInEmail } from '@/lib/email/templates/newsletter-optin';

export async function updateReaderProfile(payload: {
  name: string;
  githubUrl: string;
  phone: string;
  bio: string;
  avatar?: string;
}): Promise<{ ok: true }> {
  const reader = await getCurrentReader();
  if (!reader) redirect('/sign-in');

  const name = payload.name.trim();
  if (!name) throw new Error('Name is required');

  await prisma.reader.update({
    where: { id: reader.id },
    data: {
      name,
      githubUrl: payload.githubUrl.trim() || null,
      phone: payload.phone.trim() || null,
      bio: payload.bio.trim() || null,
      ...(payload.avatar ? { avatar: payload.avatar } : {}),
    },
  });

  revalidatePath('/account');
  return { ok: true };
}

export type SetNewsletterOptInResult = { optedIn: boolean } | { requiresAuth: true };

export async function setNewsletterOptIn(optIn: boolean): Promise<SetNewsletterOptInResult> {
  const reader = await getCurrentReader();
  if (!reader) return { requiresAuth: true };

  await prisma.reader.update({
    where: { id: reader.id },
    data: {
      newsletterOptIn: optIn,
      newsletterOptInAt: optIn ? new Date() : null,
    },
  });

  if (optIn && reader.email) {
    const resend = getResendClient();
    if (resend) {
      const { subject, html } = renderNewsletterOptInEmail({ name: reader.name });
      resend.emails
        .send({ from: getFromEmail(), to: reader.email, subject, html })
        .catch((err: unknown) => console.error('Failed to send newsletter opt-in email', err));
    }
  }

  revalidatePath('/');
  revalidatePath('/account');
  return { optedIn: optIn };
}

const SEND_BATCH_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function sendEmailToReaders(
  readerIds: string[],
  subject: string,
  message: string
): Promise<{ ok: true; sent: number } | { ok: false; error: string }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) return { ok: false, error: 'Unauthorized' };

  if (!subject.trim() || !message.trim()) {
    return { ok: false, error: 'Subject and message are required' };
  }

  const resend = getResendClient();
  if (!resend) return { ok: false, error: 'Email is not configured' };

  const readers = await prisma.reader.findMany({
    where: { id: { in: readerIds }, email: { not: null } },
    select: { email: true },
  });
  if (readers.length === 0) return { ok: false, error: 'No recipients with an email address' };

  const { html } = renderAdminMessageEmail({
    subject,
    messageHtml: message,
    authorName: author.name,
  });
  const from = getFromEmail();

  for (const batch of chunk(readers, SEND_BATCH_SIZE)) {
    await resend.batch.send(
      batch.map(({ email }) => ({
        from,
        to: email!,
        subject,
        html,
      }))
    );
  }

  return { ok: true, sent: readers.length };
}
