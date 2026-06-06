import { getPublishedPosts } from '@/lib/db/posts';
import { PostCard } from '@/components/blog/PostCard';
import { NewsletterSection } from '@/components/blog/NewsletterSection';

export const revalidate = 3600;

export default async function Home() {
  const posts = await getPublishedPosts({ limit: 10 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="mb-16 text-center">
        <h1 className="text-foreground mb-3 text-5xl font-bold">Engineering, taught well.</h1>
        <p className="text-muted-foreground text-lg">Notes from an engineer who teaches.</p>
      </section>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.length === 0 ? (
          <p className="text-muted-foreground col-span-3 text-center">No posts yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
      <div className="mt-16">
        <NewsletterSection />
      </div>
    </div>
  );
}
