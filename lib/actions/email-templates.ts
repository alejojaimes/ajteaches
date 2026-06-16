'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';

export type EmailTemplateKey = 'welcome' | 'newsletter_optin';

export type EmailTemplateItem = {
  key: string;
  subject: string;
  bodyHtml: string;
  updatedAt: Date;
};

export async function getEmailTemplates(): Promise<EmailTemplateItem[]> {
  return prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } });
}

export async function getEmailTemplate(key: string): Promise<EmailTemplateItem | null> {
  return prisma.emailTemplate.findUnique({ where: { key } });
}

export async function upsertEmailTemplate(
  key: EmailTemplateKey,
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
    create: { key, subject: trimmedSubject, bodyHtml },
    update: { subject: trimmedSubject, bodyHtml },
  });

  revalidatePath('/email-templates');
  return { ok: true };
}
