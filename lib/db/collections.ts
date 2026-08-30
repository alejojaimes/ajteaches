import { prisma } from './client';

export type CollectionNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

export type CollectionWithCount = CollectionNode & {
  /** Published posts in this collection, including all of its descendants. */
  postCount: number;
};

/** Returns the collection matching `slug` plus the ids of all its descendants. */
export async function getCollectionWithDescendantIds(
  slug: string
): Promise<{ collection: CollectionNode; ids: string[] } | null> {
  const all = await prisma.collection.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
  });

  const target = all.find((c) => c.slug === slug);
  if (!target) return null;

  const ids = [target.id];
  let frontier = [target.id];
  while (frontier.length > 0) {
    const children = all.filter((c) => c.parentId && frontier.includes(c.parentId));
    if (children.length === 0) break;
    ids.push(...children.map((c) => c.id));
    frontier = children.map((c) => c.id);
  }

  return { collection: target, ids };
}

export async function getCollectionTree(): Promise<CollectionNode[]> {
  return prisma.collection.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
    orderBy: { name: 'asc' },
  });
}

/** Top-level collections with the published-post count across each collection and its descendants. */
export async function getTopLevelCollectionsWithCounts(): Promise<CollectionWithCount[]> {
  const all = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      _count: {
        select: { posts: { where: { status: 'published', deletedAt: null } } },
      },
    },
    orderBy: { name: 'asc' },
  });

  const ownCounts = new Map(all.map((c) => [c.id, c._count.posts]));

  function descendantIds(rootId: string): string[] {
    const ids: string[] = [];
    let frontier = [rootId];
    while (frontier.length > 0) {
      const children = all.filter((c) => c.parentId && frontier.includes(c.parentId));
      if (children.length === 0) break;
      ids.push(...children.map((c) => c.id));
      frontier = children.map((c) => c.id);
    }
    return ids;
  }

  return all
    .filter((c) => c.parentId === null)
    .map((c) => {
      const total = [c.id, ...descendantIds(c.id)].reduce(
        (sum, id) => sum + (ownCounts.get(id) ?? 0),
        0
      );
      return { id: c.id, name: c.name, slug: c.slug, parentId: c.parentId, postCount: total };
    });
}
