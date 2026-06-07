import type { Comment } from '@prisma/client';
import { prisma } from './client';

export type PostCommentItem = Pick<Comment, 'id' | 'body' | 'createdAt'> & {
  reader: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type ModerationCommentItem = Pick<Comment, 'id' | 'body' | 'createdAt'> & {
  reader: {
    id: string;
    name: string;
    avatar: string | null;
  };
  post: {
    id: string;
    title: string;
    slug: string;
  };
};

export async function getPostComments(postId: string): Promise<PostCommentItem[]> {
  return prisma.comment.findMany({
    where: { postId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      body: true,
      createdAt: true,
      reader: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function getAllCommentsForModeration(): Promise<ModerationCommentItem[]> {
  return prisma.comment.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      body: true,
      createdAt: true,
      reader: { select: { id: true, name: true, avatar: true } },
      post: { select: { id: true, title: true, slug: true } },
    },
  });
}
