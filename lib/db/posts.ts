import type { Post, PostStatus, Tag } from '@prisma/client';
import { prisma } from './client';

export type OwnerPostsFilter = 'all' | 'draft' | 'published';

export type OwnerPostListItem = Pick<
  Post,
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'coverImage'
  | 'status'
  | 'postType'
  | 'readTimeMinutes'
  | 'readTimeOverride'
  | 'publishedAt'
  | 'updatedAt'
> & {
  views: number;
  tags: Tag[];
};

export const OWNER_POSTS_PAGE_SIZE = 6;

export async function getOwnerPosts(
  authorId: string,
  filter: OwnerPostsFilter,
  page: number
): Promise<{ posts: OwnerPostListItem[]; hasMore: boolean }> {
  const statusFilter: { status: PostStatus } | object =
    filter === 'all' ? {} : { status: filter as PostStatus };

  const where = { authorId, deletedAt: null, ...statusFilter };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: page * OWNER_POSTS_PAGE_SIZE,
      include: { tags: true },
    }),
    prisma.post.count({ where }),
  ]);

  const postIds = posts.map((post) => post.id);
  const viewCounts = postIds.length
    ? await prisma.postEvent.groupBy({
        by: ['postId'],
        where: { postId: { in: postIds }, eventType: 'view' },
        _count: { _all: true },
      })
    : [];
  const viewsByPost = new Map(viewCounts.map((row) => [row.postId, row._count._all]));

  return {
    posts: posts.map((post) => ({ ...post, views: viewsByPost.get(post.id) ?? 0 })),
    hasMore: posts.length < total,
  };
}

export async function getPublishedPosts({
  limit = 10,
  type,
  collectionIds,
  query,
}: {
  limit?: number;
  type?: 'blog' | 'tutorial';
  collectionIds?: string[];
  query?: string;
} = {}) {
  const posts = await prisma.post.findMany({
    where: {
      status: 'published',
      deletedAt: null,
      ...(type ? { postType: type } : {}),
      ...(collectionIds ? { collectionId: { in: collectionIds } } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { excerpt: { contains: query, mode: 'insensitive' } },
              { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: { author: true, tags: true, collection: true },
  });

  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);

  const [viewCounts, likeCounts, commentCounts] = await Promise.all([
    prisma.postEvent.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds }, eventType: 'view' },
      _count: { _all: true },
    }),
    prisma.postLike.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: { _all: true },
    }),
    prisma.comment.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds }, deletedAt: null },
      _count: { _all: true },
    }),
  ]);

  const views = new Map(viewCounts.map((r) => [r.postId, r._count._all]));
  const likes = new Map(likeCounts.map((r) => [r.postId, r._count._all]));
  const comments = new Map(commentCounts.map((r) => [r.postId, r._count._all]));

  return posts.map((post) => ({
    ...post,
    viewCount: views.get(post.id) ?? 0,
    likeCount: likes.get(post.id) ?? 0,
    commentCount: comments.get(post.id) ?? 0,
  }));
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug, deletedAt: null },
    include: {
      author: true,
      tags: true,
      attachments: true,
      collection: { include: { parent: true } },
    },
  });
}
