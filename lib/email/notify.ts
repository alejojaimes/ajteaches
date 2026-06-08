import { prisma } from '@/lib/db/client';
import { getResendClient, getFromEmail } from './client';
import { renderNewPostEmail } from './templates/new-post';

const BATCH_SIZE = 100;

type PublishedPost = {
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  slug: string;
  author: { name: string };
};

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function notifyReadersOnPostPublished(post: PublishedPost): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const readers = await prisma.reader.findMany({
    where: { newsletterOptIn: true, email: { not: null } },
    select: { email: true },
  });
  if (readers.length === 0) return;

  const { subject, html } = renderNewPostEmail({
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    slug: post.slug,
    authorName: post.author.name,
  });
  const from = getFromEmail();

  for (const batch of chunk(readers, BATCH_SIZE)) {
    await resend.batch.send(
      batch.map(({ email }) => ({
        from,
        to: email!,
        subject,
        html,
      }))
    );
  }
}
