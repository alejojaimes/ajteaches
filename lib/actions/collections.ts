'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';

export type CollectionListItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export async function getCollections(): Promise<CollectionListItem[]> {
  return prisma.collection.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
    orderBy: { name: 'asc' },
  });
}

export async function createCollection(
  name: string,
  parentId?: string | null
): Promise<CollectionListItem> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const trimmed = name.trim();
  if (!trimmed) throw new Error('Collection name is required');

  const base = slugify(trimmed) || `collection-${Date.now()}`;
  const existing = await prisma.collection.findUnique({ where: { slug: base } });
  const slug = existing ? `${base}-${Date.now().toString(36)}` : base;

  return prisma.collection.create({
    data: { name: trimmed, slug, parentId: parentId ?? null },
    select: { id: true, name: true, slug: true, parentId: true },
  });
}

export async function setPostCollection(
  postId: string,
  collectionId: string | null
): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  await prisma.post.update({ where: { id: postId }, data: { collectionId } });

  if (post.status === 'published') {
    revalidatePath('/');
    revalidatePath(`/posts/${post.slug}`);
  }

  return { ok: true };
}
