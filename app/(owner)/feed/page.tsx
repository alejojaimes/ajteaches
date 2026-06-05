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
            className="rounded-button bg-primary hover:bg-primary-hover px-4 py-2 text-sm font-medium text-white"
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
            <article key={post.id} className="rounded-card border-border bg-card border p-4">
              <div className="flex items-start justify-between">
                <div>
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
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
