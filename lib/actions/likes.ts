'use server';

import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { prisma } from '@/lib/db/client';

export type ToggleLikeResult = { liked: boolean; count: number } | { requiresAuth: true };

export async function toggleLike(postId: string): Promise<ToggleLikeResult> {
  const reader = await getCurrentReader();
  if (!reader) return { requiresAuth: true };

  const existing = await prisma.postLike.findUnique({
    where: { postId_readerId: { postId, readerId: reader.id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, readerId: reader.id } });
  }

  const count = await prisma.postLike.count({ where: { postId } });

  return { liked: !existing, count };
}

export async function getLikeState(postId: string): Promise<{ liked: boolean; count: number }> {
  const reader = await getCurrentReader();
  const count = await prisma.postLike.count({ where: { postId } });

  if (!reader) return { liked: false, count };

  const existing = await prisma.postLike.findUnique({
    where: { postId_readerId: { postId, readerId: reader.id } },
  });

  return { liked: !!existing, count };
}
