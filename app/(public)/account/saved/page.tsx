import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { getSavedPosts } from '@/lib/db/saves';
import { toggleSave, togglePin } from '@/lib/actions/saves';
import { PinToggleButton } from '@/components/account/PinToggleButton';
import { RemoveSaveButton } from '@/components/account/RemoveSaveButton';
import { formatRelativeTime } from '@/lib/utils';

export default async function SavedPostsPage() {
  const reader = await getCurrentReader();
  if (!reader) redirect('/sign-in');

  const savedPosts = await getSavedPosts(reader.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <Link href="/account" className="text-muted-foreground hover:text-primary text-sm">
          ← Back to account
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-bold">Saved posts</h1>
      </div>

      {savedPosts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You haven&apos;t saved any posts yet.{' '}
          <Link href="/" className="text-primary hover:text-primary-hover font-medium">
            Browse posts
          </Link>
        </p>
      ) : (
        <ul className="space-y-4">
          {savedPosts.map((item) => {
            const readTime = item.post.readTimeOverride ?? item.post.readTimeMinutes;

            async function pin() {
              'use server';
              await togglePin(item.post.id);
            }

            async function remove() {
              'use server';
              await toggleSave(item.post.id);
            }

            return (
              <li key={item.post.id} className="rounded-card border-border bg-card border p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/posts/${item.post.slug}`}
                        className="text-foreground hover:text-primary line-clamp-1 text-base font-bold transition-colors"
                      >
                        {item.post.title}
                      </Link>
                      {item.pinned && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          Pinned
                        </span>
                      )}
                    </div>
                    {item.post.excerpt && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {item.post.excerpt}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-2 text-xs">
                      {item.post.author.name} · saved {formatRelativeTime(item.createdAt)} ·{' '}
                      {readTime} min read
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <PinToggleButton pinned={item.pinned} pinAction={pin} />
                    <RemoveSaveButton removeAction={remove} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
