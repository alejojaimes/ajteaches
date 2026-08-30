'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { getResendClient, getFromEmail } from '@/lib/email/client';
import { renderDbTemplate } from '@/lib/email/render-db-template';

const PREDEFINED_KEYS = new Set(['welcome', 'newsletter_optin']);
const SAMPLE_READER_NAME = 'Sample Reader';

export type EmailTemplateItem = {
  key: string;
  name: string;
  subject: string;
  bodyHtml: string;
  updatedAt: Date;
};

export async function getEmailTemplates(): Promise<EmailTemplateItem[]> {
  return prisma.emailTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
}

export async function getEmailTemplate(key: string): Promise<EmailTemplateItem | null> {
  return prisma.emailTemplate.findUnique({ where: { key } });
}

/** Save a predefined template (welcome, newsletter_optin). */
export async function upsertEmailTemplate(
  key: string,
  name: string,
  subject: string,
  bodyHtml: string
): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const trimmedSubject = subject.trim();
  if (!trimmedSubject) throw new Error('Subject is required');
  if (!bodyHtml.trim()) throw new Error('Body is required');

  await prisma.emailTemplate.upsert({
    where: { key },
    create: { key, name: name.trim(), subject: trimmedSubject, bodyHtml },
    update: { name: name.trim(), subject: trimmedSubject, bodyHtml },
  });

  revalidatePath('/email-templates');
  return { ok: true };
}

/** Create a new custom template (key auto-generated). */
export async function createEmailTemplate(
  name: string,
  subject: string,
  bodyHtml: string
): Promise<EmailTemplateItem> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const trimmedName = name.trim();
  const trimmedSubject = subject.trim();
  if (!trimmedName) throw new Error('Name is required');
  if (!trimmedSubject) throw new Error('Subject is required');
  if (!bodyHtml.trim()) throw new Error('Body is required');

  const template = await prisma.emailTemplate.create({
    data: { name: trimmedName, subject: trimmedSubject, bodyHtml },
  });

  revalidatePath('/email-templates');
  return template;
}

/** Update an existing custom template. */
export async function updateEmailTemplate(
  key: string,
  name: string,
  subject: string,
  bodyHtml: string
): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const trimmedSubject = subject.trim();
  if (!name.trim()) throw new Error('Name is required');
  if (!trimmedSubject) throw new Error('Subject is required');
  if (!bodyHtml.trim()) throw new Error('Body is required');

  await prisma.emailTemplate.update({
    where: { key },
    data: { name: name.trim(), subject: trimmedSubject, bodyHtml },
  });

  revalidatePath('/email-templates');
  return { ok: true };
}

/** Render a template with sample data, exactly as it will be sent. */
export async function previewEmailTemplate(
  subject: string,
  bodyHtml: string
): Promise<{ subject: string; html: string }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  return renderDbTemplate(subject, bodyHtml, { name: SAMPLE_READER_NAME });
}

/** Send this template to a single address so the owner can check how it lands. */
export async function sendTestEmailTemplate(
  subject: string,
  bodyHtml: string,
  to: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) return { ok: false, error: 'Unauthorized' };

  const trimmedTo = to.trim();
  if (!trimmedTo) return { ok: false, error: 'Recipient email is required' };
  if (!subject.trim() || !bodyHtml.trim()) {
    return { ok: false, error: 'Subject and body are required' };
  }

  const resend = getResendClient();
  if (!resend) return { ok: false, error: 'Email is not configured' };

  const { subject: resolvedSubject, html } = renderDbTemplate(subject, bodyHtml, {
    name: SAMPLE_READER_NAME,
  });

  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: trimmedTo,
    subject: `[Test] ${resolvedSubject}`,
    html,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

/** Delete a custom template. Predefined templates cannot be deleted. */
export async function deleteEmailTemplate(key: string): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');
  if (PREDEFINED_KEYS.has(key)) throw new Error('Predefined templates cannot be deleted');

  await prisma.emailTemplate.delete({ where: { key } });
  revalidatePath('/email-templates');
  return { ok: true };
}
