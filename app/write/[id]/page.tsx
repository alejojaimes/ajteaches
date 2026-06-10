import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import {
  updatePost,
  publishPost,
  republishPost,
  deletePost,
  getTags,
  setGithubRepo,
  searchAuthorPosts,
  type GithubRepoSnapshot,
} from '@/lib/actions/posts';
import { addAttachment, removeAttachment } from '@/lib/actions/attachments';
import {
  getCollections,
  createCollection,
  setPostCollection,
  type CollectionListItem,
} from '@/lib/actions/collections';
import {
  TiptapEditor,
  type SavePayload,
  type AuthorPostResult,
} from '@/components/editor/TiptapEditor';
import { PublishButton } from '@/components/editor/PublishButton';
import { ShareDraftButton } from '@/components/editor/ShareDraftButton';
import { DeletePostButton } from '@/components/editor/DeletePostButton';

export default async function WritePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
    include: { tags: true, attachments: true },
  });
  if (!post || post.authorId !== author.id) notFound();

  const allTags = await getTags();
  const collections = await getCollections();

  async function save(payload: SavePayload) {
    'use server';
    await updatePost(id, {
      title: payload.title,
      excerpt: payload.excerpt,
      contentJson: JSON.parse(payload.contentJson) as object,
      wordCount: payload.wordCount,
      tags: payload.tags,
      postType: payload.postType,
    });
  }

  async function setRepo(url: string): Promise<{ ok: true; repo: GithubRepoSnapshot | null }> {
    'use server';
    return setGithubRepo(id, url);
  }

  async function addFile(data: {
    url: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<{ ok: true; id: string }> {
    'use server';
    return addAttachment(id, data);
  }

  async function removeFile(attachmentId: string): Promise<{ ok: true }> {
    'use server';
    return removeAttachment(attachmentId);
  }

  async function setCollection(collectionId: string | null): Promise<{ ok: true }> {
    'use server';
    return setPostCollection(id, collectionId);
  }

  async function createCollectionAction(
    name: string,
    parentId: string | null
  ): Promise<CollectionListItem> {
    'use server';
    return createCollection(name, parentId);
  }

  async function searchPosts(query: string): Promise<AuthorPostResult[]> {
    'use server';
    return searchAuthorPosts(query);
  }

  async function publish() {
    'use server';
    await publishPost(id);
  }

  async function republish() {
    'use server';
    await republishPost(id);
  }

  async function del() {
    'use server';
    await deletePost(id);
  }

  const content =
    post.contentJson && typeof post.contentJson === 'object' && !Array.isArray(post.contentJson)
      ? (post.contentJson as object)
      : null;

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/feed" className="text-muted-foreground hover:text-foreground text-sm">
              ← Feed
            </Link>
            <DeletePostButton deleteAction={del} postTitle={post.title} iconOnly />
          </div>
          <Link href="/" className="text-foreground text-sm font-medium">
            ajteaches
          </Link>
          <div className="flex items-center gap-2">
            <ShareDraftButton postId={post.id} />
            <PublishButton
              action={publish}
              updateAction={republish}
              isPublished={post.status === 'published'}
            />
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
          initialPostType={post.postType}
          initialGithubRepoUrl={post.githubRepoUrl ?? ''}
          initialGithubRepo={
            post.githubRepoData && typeof post.githubRepoData === 'object'
              ? (post.githubRepoData as unknown as GithubRepoSnapshot)
              : null
          }
          initialAttachments={post.attachments.map((a) => ({
            id: a.id,
            url: a.url,
            filename: a.filename,
            mimeType: a.mimeType,
            sizeBytes: a.sizeBytes,
          }))}
          collections={collections}
          initialCollectionId={post.collectionId}
          onSave={save}
          onSetGithubRepo={setRepo}
          onAddAttachment={addFile}
          onRemoveAttachment={removeFile}
          onSetCollection={setCollection}
          onCreateCollection={createCollectionAction}
          onSearchPosts={searchPosts}
        />
      </main>
    </div>
  );
}
