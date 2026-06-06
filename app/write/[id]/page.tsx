import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { updatePost, publishPost, getTags } from '@/lib/actions/posts';
import { TiptapEditor, type SavePayload } from '@/components/editor/TiptapEditor';
import { PublishButton } from '@/components/editor/PublishButton';
import { ShareDraftButton } from '@/components/editor/ShareDraftButton';

export default async function WritePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
    include: { tags: true },
  });
  if (!post || post.authorId !== author.id) notFound();

  const allTags = await getTags();

  async function save(payload: SavePayload) {
    'use server';
    await updatePost(id, {
      title: payload.title,
      excerpt: payload.excerpt,
      contentJson: JSON.parse(payload.contentJson) as object,
      wordCount: payload.wordCount,
      tags: payload.tags,
    });
  }

  async function publish() {
    'use server';
    await publishPost(id);
  }

  const content =
    post.contentJson && typeof post.contentJson === 'object' && !Array.isArray(post.contentJson)
      ? (post.contentJson as object)
      : null;

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/feed" className="text-muted-foreground hover:text-foreground text-sm">
            ← Feed
          </Link>
          <Link href="/" className="text-foreground text-sm font-medium">
            ajteaches
          </Link>
          <div className="flex items-center gap-2">
            <ShareDraftButton postId={post.id} />
            <PublishButton action={publish} isPublished={post.status === 'published'} />
          </div>
        </div>
      </header>

      <main className="px-4">
        <TiptapEditor
          postId={post.id}
          initialTitle={post.title === 'Untitled' ? '' : post.title}
          initialExcerpt={post.excerpt ?? ''}
          initialContent={content}
          initialTags={(post.tags ?? []).map((t) => t.name)}
          allTags={allTags.map((t) => t.name)}
          onSave={save}
        />
      </main>
    </div>
  );
}
