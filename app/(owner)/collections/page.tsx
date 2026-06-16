import { getCollections } from '@/lib/actions/collections';
import { CollectionsManager } from '@/components/owner/CollectionsManager';

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-2xl">
      <h1 className="text-foreground mb-6 text-2xl font-bold">Collections</h1>
      <CollectionsManager initialCollections={collections} />
    </div>
  );
}
