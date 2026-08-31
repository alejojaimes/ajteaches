'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { getResendClient, getFromEmail } from '@/lib/email/client';
import { renderAdminMessageEmail } from '@/lib/email/templates/admin-message';
import { renderNewsletterOptInEmail } from '@/lib/email/templates/newsletter-optin';
import { renderDbTemplate } from '@/lib/email/render-db-template';
import { findUnresolvedPlaceholders } from '@/lib/email/placeholders';

const SAMPLE_READER_NAME = 'Sample Reader';

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
      const dbTemplate = await prisma.emailTemplate.findUnique({
        where: { key: 'newsletter_optin' },
      });
      const { subject, html } = dbTemplate
        ? renderDbTemplate(dbTemplate.subject, dbTemplate.bodyHtml, { name: reader.name })
        : renderNewsletterOptInEmail({ name: reader.name });
      const unresolved = findUnresolvedPlaceholders(`${subject} ${html}`);
      if (unresolved.length > 0) {
        console.error(
          `Newsletter opt-in email has unresolved placeholders: ${unresolved.join(', ')}`
        );
      } else {
        resend.emails
          .send({ from: getFromEmail(), to: reader.email, subject, html })
          .catch((err: unknown) => console.error('Failed to send newsletter opt-in email', err));
      }
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
    select: { email: true, name: true },
  });
  if (readers.length === 0) return { ok: false, error: 'No recipients with an email address' };

  const from = getFromEmail();

  for (const batch of chunk(readers, SEND_BATCH_SIZE)) {
    const emails = batch.map(({ email, name }) => {
      const rendered = renderAdminMessageEmail({
        subject,
        messageHtml: message,
        authorName: author.name,
        vars: { name },
      });
      return { from, to: email!, subject: rendered.subject, html: rendered.html };
    });

    const unresolved = emails.flatMap((e) => findUnresolvedPlaceholders(`${e.subject} ${e.html}`));
    if (unresolved.length > 0) {
      return {
        ok: false,
        error: `Unresolved placeholder(s): ${Array.from(new Set(unresolved)).join(', ')}. Only {{name}} is supported.`,
      };
    }

    const { error } = await resend.batch.send(emails);
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true, sent: readers.length };
}

/** Render an ad-hoc admin message exactly as it will be sent. */
export async function previewAdminMessage(
  subject: string,
  message: string
): Promise<{ html: string }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const rendered = renderAdminMessageEmail({
    subject,
    messageHtml: message,
    authorName: author.name,
    vars: { name: SAMPLE_READER_NAME },
  });

  const unresolved = findUnresolvedPlaceholders(`${rendered.subject} ${rendered.html}`);
  if (unresolved.length > 0) {
    throw new Error(
      `Unresolved placeholder(s): ${unresolved.join(', ')}. Only {{name}} is supported.`
    );
  }

  return { html: rendered.html };
}

/** Send an ad-hoc admin message to a single address so the owner can check how it lands. */
export async function sendTestAdminMessage(
  subject: string,
  message: string,
  to: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) return { ok: false, error: 'Unauthorized' };

  const trimmedTo = to.trim();
  if (!trimmedTo) return { ok: false, error: 'Recipient email is required' };
  if (!subject.trim() || !message.trim()) {
    return { ok: false, error: 'Subject and message are required' };
  }

  const resend = getResendClient();
  if (!resend) return { ok: false, error: 'Email is not configured' };

  const rendered = renderAdminMessageEmail({
    subject,
    messageHtml: message,
    authorName: author.name,
    vars: { name: SAMPLE_READER_NAME },
  });

  const unresolved = findUnresolvedPlaceholders(`${rendered.subject} ${rendered.html}`);
  if (unresolved.length > 0) {
    return {
      ok: false,
      error: `Unresolved placeholder(s): ${unresolved.join(', ')}. Only {{name}} is supported.`,
    };
  }

  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: trimmedTo,
    subject: `[Test] ${rendered.subject}`,
    html: rendered.html,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
