import type { Post, SavedPost } from '@prisma/client';
import { prisma } from './client';

export type SavedPostItem = Pick<SavedPost, 'pinned' | 'createdAt'> & {
  post: Pick<
    Post,
    | 'id'
    | 'title'
    | 'slug'
    | 'excerpt'
    | 'coverImage'
    | 'readTimeMinutes'
    | 'readTimeOverride'
    | 'postType'
    | 'publishedAt'
  > & {
    author: {
      name: string;
      avatar: string | null;
    };
  };
};

export async function getSavedPosts(readerId: string): Promise<SavedPostItem[]> {
  return prisma.savedPost.findMany({
    where: { readerId },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    select: {
      pinned: true,
      createdAt: true,
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          readTimeMinutes: true,
          readTimeOverride: true,
          postType: true,
          publishedAt: true,
          author: { select: { name: true, avatar: true } },
        },
      },
    },
  });
}

export async function getSavedPostIds(readerId: string, postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();

  const saved = await prisma.savedPost.findMany({
    where: { readerId, postId: { in: postIds } },
    select: { postId: true },
  });

  return new Set(saved.map((s) => s.postId));
}
