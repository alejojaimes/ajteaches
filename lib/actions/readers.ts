'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { prisma } from '@/lib/db/client';

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

  revalidatePath('/');
  revalidatePath('/account');
  return { optedIn: optIn };
}
