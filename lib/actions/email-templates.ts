'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';

const PREDEFINED_KEYS = new Set(['welcome', 'newsletter_optin']);

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

/** Delete a custom template. Predefined templates cannot be deleted. */
export async function deleteEmailTemplate(key: string): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');
  if (PREDEFINED_KEYS.has(key)) throw new Error('Predefined templates cannot be deleted');

  await prisma.emailTemplate.delete({ where: { key } });
  revalidatePath('/email-templates');
  return { ok: true };
}
