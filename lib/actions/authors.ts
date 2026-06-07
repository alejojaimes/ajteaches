'use server';

import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';

export async function updateAuthor(payload: {
  name: string;
  bio: string;
  website: string;
  githubUrl: string;
  linkedinUrl: string;
  location: string;
  roles: string[];
  interests: string[];
  avatar?: string;
}): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  await prisma.author.update({
    where: { id: author.id },
    data: {
      name: payload.name.trim() || author.name,
      bio: payload.bio.trim() || null,
      website: payload.website.trim() || null,
      githubUrl: payload.githubUrl.trim() || null,
      linkedinUrl: payload.linkedinUrl.trim() || null,
      location: payload.location.trim() || null,
      roles: payload.roles,
      interests: payload.interests,
      ...(payload.avatar ? { avatar: payload.avatar } : {}),
    },
  });

  return { ok: true };
}
