'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';

export async function createComment(input: {
  postId: string;
  slug: string;
  body: string;
}): Promise<{ ok: true }> {
  const reader = await getCurrentReader();
  if (!reader) redirect('/sign-in');

  const body = input.body.trim();
  if (!body) throw new Error('Comment body cannot be empty');

  await prisma.comment.create({
    data: {
      postId: input.postId,
      readerId: reader.id,
      body,
    },
  });

  revalidatePath(`/posts/${input.slug}`);
  return { ok: true };
}

export async function deleteComment(commentId: string): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) redirect('/sign-in');

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/comments');
  return { ok: true };
}
