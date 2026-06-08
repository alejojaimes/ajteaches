import { getPublishedPosts } from '@/lib/db/posts';
import { getSavedPostIds } from '@/lib/db/saves';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { getServerDictionary } from '@/lib/i18n/get-locale';
import { getFirstContentImage } from '@/lib/render-post';
import { PostCard } from '@/components/blog/PostCard';
import { NewsletterSection } from '@/components/blog/NewsletterSection';
import { AnimatedHeroTitle } from '@/components/blog/AnimatedHeroTitle';
import { Reveal } from '@/components/profile/Reveal';

export default async function Home() {
  const [posts, reader, t] = await Promise.all([
    getPublishedPosts({ limit: 10 }),
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
        <Reveal delay={0.16}>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm">{t.hero.intro}</p>
        </Reveal>
      </section>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.length === 0 ? (
          <p className="text-muted-foreground col-span-3 text-center">{t.hero.noPosts}</p>
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
      <div className="mt-16">
        <Reveal>
          <NewsletterSection reader={reader ? { newsletterOptIn: reader.newsletterOptIn } : null} />
        </Reveal>
      </div>
    </div>
  );
}
