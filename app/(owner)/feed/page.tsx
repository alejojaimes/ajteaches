import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { createPost, deletePost } from '@/lib/actions/posts';
import { getOwnerPosts, OWNER_POSTS_PAGE_SIZE, type OwnerPostsFilter } from '@/lib/db/posts';
import { FeedPostCard } from '@/components/feed/FeedPostCard';

const TABS: { key: OwnerPostsFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'published', label: 'Published' },
];

function parseFilter(value: string | undefined): OwnerPostsFilter {
  return value === 'draft' || value === 'published' ? value : 'all';
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

type Props = {
  searchParams: Promise<{ filter?: string; page?: string }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const params = await searchParams;
  const filter = parseFilter(params.filter);
  const page = parsePage(params.page);

  const { posts, hasMore } = await getOwnerPosts(author.id, filter, page);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-bold">Your Posts</h1>
        <form action={createPost}>
          <button
            type="submit"
            className="rounded-button bg-primary hover:bg-primary-hover hover:shadow-primary/20 px-4 py-2 text-sm font-medium text-white transition-transform duration-100 hover:shadow-md active:scale-95"
          >
            + New Post
          </button>
        </form>
      </header>

      <div className="border-border mb-6 flex items-center gap-1 border-b">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === 'all' ? '/feed' : `/feed?filter=${tab.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'Start writing your first post.'
              : `No ${filter === 'draft' ? 'drafts' : 'published posts'} yet.`}
          </p>
        ) : (
          posts.map((post) => {
            async function del() {
              'use server';
              await deletePost(post.id);
            }
            return (
              <FeedPostCard
                key={post.id}
                post={post}
                author={{ name: author.name, avatar: author.avatar }}
                onDelete={del}
              />
            );
          })
        )}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/feed?${filter !== 'all' ? `filter=${filter}&` : ''}page=${page + 1}`}
            className="rounded-button border-border text-foreground hover:border-primary hover:text-primary border px-5 py-2 text-sm font-medium transition-colors"
          >
            Load older posts
          </Link>
        </div>
      )}

      {posts.length > 0 && !hasMore && posts.length > OWNER_POSTS_PAGE_SIZE && (
        <p className="text-muted-foreground mt-8 text-center text-xs">
          You&apos;ve reached the end — {posts.length} posts total.
        </p>
      )}
    </div>
  );
}
