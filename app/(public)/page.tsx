import Link from 'next/link';
import { Suspense } from 'react';
import { getPublishedPosts } from '@/lib/db/posts';
import { getSavedPostIds } from '@/lib/db/saves';
import {
  getCollectionWithDescendantIds,
  getTopLevelCollectionsWithCounts,
} from '@/lib/db/collections';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { getServerDictionary } from '@/lib/i18n/get-locale';
import { getFirstContentImage } from '@/lib/render-post';
import { PostCard } from '@/components/blog/PostCard';
import { AnimatedHeroTitle } from '@/components/blog/AnimatedHeroTitle';
import { EmptyPostsState } from '@/components/blog/EmptyPostsState';
import { SearchBar } from '@/components/blog/SearchBar';
import { SubscribePopup } from '@/components/blog/SubscribePopup';
import { Reveal } from '@/components/profile/Reveal';

type PostType = 'blog' | 'tutorial';

function isPostType(value: string | undefined): value is PostType {
  return value === 'blog' || value === 'tutorial';
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; collection?: string; q?: string }>;
}) {
  const { type: typeParam, collection: collectionParam, q } = await searchParams;
  const type = isPostType(typeParam) ? typeParam : undefined;
  const query = q?.trim() || undefined;

  const [collectionFilter, topLevelCollections] = await Promise.all([
    collectionParam ? getCollectionWithDescendantIds(collectionParam) : null,
    type === 'tutorial' ? getTopLevelCollectionsWithCounts() : Promise.resolve([]),
  ]);

  const [posts, reader, t] = await Promise.all([
    getPublishedPosts({ limit: 10, type, collectionIds: collectionFilter?.ids, query }),
    getCurrentReader(),
    getServerDictionary(),
  ]);
  const savedPostIds = reader
    ? await getSavedPostIds(
        reader.id,
        posts.map((post) => post.id)
      )
    : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="relative mb-16 overflow-hidden text-center">
        <div className="from-primary/20 via-accent/10 absolute inset-x-0 -top-24 -z-10 mx-auto h-64 max-w-2xl rounded-full bg-gradient-to-br to-transparent blur-3xl" />
        <Reveal>
          <AnimatedHeroTitle prefix={t.hero.titlePrefix} words={t.hero.titleWords} />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-muted-foreground text-lg">{t.hero.subtitle}</p>
        </Reveal>
      </section>

      {type && (
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-bold">
            {type === 'blog' ? t.contentMode.blogTitle : t.contentMode.tutorialTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {type === 'blog' ? t.contentMode.blogSubtitle : t.contentMode.tutorialSubtitle}
          </p>
        </div>
      )}

      <Suspense>
        <SearchBar initialQuery={query ?? ''} />
      </Suspense>

      {topLevelCollections.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/?type=tutorial"
            className={`rounded-badge px-3 py-1 text-xs font-semibold transition-colors ${
              !collectionFilter
                ? 'bg-primary text-white'
                : 'bg-primary-soft text-primary hover:bg-primary/20'
            }`}
          >
            {t.hero.allCollections}
          </Link>
          {topLevelCollections.map((c) => {
            const active = collectionFilter?.collection.id === c.id;
            return (
              <Link
                key={c.id}
                href={`/?type=tutorial&collection=${c.slug}`}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors ${
                  active
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                <span className="font-semibold">{c.name}</span>
                <span
                  className={active ? 'text-primary/70 text-xs' : 'text-muted-foreground text-xs'}
                >
                  {t.contentMode.collectionPostCount(c.postCount)}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.length === 0 ? (
          <EmptyPostsState query={query} />
        ) : (
          posts.map((post, index) => (
            <Reveal key={post.id} delay={Math.min(index, 6) * 0.06}>
              <PostCard
                post={{
                  ...post,
                  coverImage: post.coverImage ?? getFirstContentImage(post.contentJson),
                }}
                initialSaved={savedPostIds.has(post.id)}
              />
            </Reveal>
          ))
        )}
      </section>

      <SubscribePopup isSubscribed={reader?.newsletterOptIn ?? false} />
    </div>
  );
}
