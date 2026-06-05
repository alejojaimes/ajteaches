import { prisma } from './client';

export async function getPublishedPosts({
  limit = 10,
  type,
}: { limit?: number; type?: 'blog' | 'tutorial' } = {}) {
  return prisma.post.findMany({
    where: {
      status: 'published',
      deletedAt: null,
      ...(type ? { postType: type } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: { author: true },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug, deletedAt: null },
    include: { author: true },
  });
}
