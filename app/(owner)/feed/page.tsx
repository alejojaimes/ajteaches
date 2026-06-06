import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { createPost } from '@/lib/actions/posts';

export default async function FeedPage() {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const posts = await prisma.post.findMany({
    where: { authorId: author.id, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
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
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">Start writing your first post.</p>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="rounded-card border-border bg-card cursor-default border p-4 transition-shadow duration-150 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground font-medium">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-muted-foreground mt-1 text-sm">{post.excerpt}</p>
                  )}
                  <div className="text-muted-foreground mt-2 flex gap-2 text-xs">
                    <span className="rounded-badge bg-primary-soft text-primary px-2 py-0.5 font-medium">
                      {post.status}
                    </span>
                    <span>·</span>
                    <span>{post.readTimeMinutes} min read</span>
                  </div>
                </div>
                <Link
                  href={`/write/${post.id}`}
                  className="rounded-button border-border text-muted-foreground hover:border-primary hover:text-primary ml-4 inline-flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-[1.03]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Edit
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
