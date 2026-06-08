'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { prisma } from '@/lib/db/client';

export type ToggleSaveResult = { saved: boolean } | { requiresAuth: true };
export type TogglePinResult = { pinned: boolean } | { requiresAuth: true };

export async function toggleSave(postId: string): Promise<ToggleSaveResult> {
  const reader = await getCurrentReader();
  if (!reader) return { requiresAuth: true };

  const existing = await prisma.savedPost.findUnique({
    where: { postId_readerId: { postId, readerId: reader.id } },
  });

  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedPost.create({ data: { postId, readerId: reader.id } });
  }

  revalidatePath('/account/saved');

  return { saved: !existing };
}

export async function togglePin(postId: string): Promise<TogglePinResult> {
  const reader = await getCurrentReader();
  if (!reader) return { requiresAuth: true };

  const existing = await prisma.savedPost.findUnique({
    where: { postId_readerId: { postId, readerId: reader.id } },
  });
  if (!existing) return { pinned: false };

  const updated = await prisma.savedPost.update({
    where: { id: existing.id },
    data: { pinned: !existing.pinned },
  });

  revalidatePath('/account/saved');

  return { pinned: updated.pinned };
}

export async function getSaveState(postId: string): Promise<{ saved: boolean }> {
  const reader = await getCurrentReader();
  if (!reader) return { saved: false };

  const existing = await prisma.savedPost.findUnique({
    where: { postId_readerId: { postId, readerId: reader.id } },
  });

  return { saved: !!existing };
}
