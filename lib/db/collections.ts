import { prisma } from './client';

export type CollectionNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
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
