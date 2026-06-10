import { prisma } from './client';

export type ReaderListItem = {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  newsletterOptIn: boolean;
  createdAt: Date;
};

export const READERS_PAGE_SIZE = 20;

export async function getReaders(
  page: number
): Promise<{ readers: ReaderListItem[]; hasMore: boolean }> {
  const [readers, total] = await Promise.all([
    prisma.reader.findMany({
      orderBy: { createdAt: 'desc' },
      take: page * READERS_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        newsletterOptIn: true,
        createdAt: true,
      },
    }),
    prisma.reader.count(),
  ]);

  return { readers, hasMore: readers.length < total };
}
