'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { prisma } from '@/lib/db/client';

export async function updateReaderProfile(payload: {
  name: string;
  githubUrl: string;
  phone: string;
}): Promise<{ ok: true }> {
  const reader = await getCurrentReader();
  if (!reader) redirect('/sign-in');

  await prisma.reader.update({
    where: { id: reader.id },
    data: {
      name: payload.name.trim() || reader.name,
      githubUrl: payload.githubUrl.trim() || null,
      phone: payload.phone.trim() || null,
    },
  });

  revalidatePath('/account');
  return { ok: true };
}
