import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { updatePost, publishPost } from '@/lib/actions/posts';
import { TiptapEditor, type SavePayload } from '@/components/editor/TiptapEditor';
import { PublishButton } from '@/components/editor/PublishButton';

export default async function WritePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const post = await prisma.post.findUnique({ where: { id, deletedAt: null } });
  if (!post || post.authorId !== author.id) notFound();

  async function save(payload: SavePayload) {
    'use server';
    await updatePost(id, {
      title: payload.title,
      excerpt: payload.excerpt,
      contentJson: JSON.parse(payload.contentJson) as object,
      wordCount: payload.wordCount,
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
          <PublishButton action={publish} isPublished={post.status === 'published'} />
        </div>
      </header>

      <main className="px-4">
        <TiptapEditor
          postId={post.id}
          initialTitle={post.title === 'Untitled' ? '' : post.title}
          initialExcerpt={post.excerpt ?? ''}
          initialContent={content}
          onSave={save}
        />
      </main>
    </div>
  );
}
