'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';

function resourceTypeForMime(mimeType: string): 'image' | 'video' | 'raw' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'raw';
}

export async function addAttachment(
  postId: string,
  data: { url: string; filename: string; mimeType: string; sizeBytes: number }
): Promise<{ ok: true; id: string }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  const attachment = await prisma.postAttachment.create({
    data: {
      postId,
      url: data.url,
      filename: data.filename,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
    },
  });

  if (post.status === 'published') revalidatePath(`/posts/${post.slug}`);

  return { ok: true, id: attachment.id };
}

export async function removeAttachment(attachmentId: string): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const attachment = await prisma.postAttachment.findUnique({
    where: { id: attachmentId },
    include: { post: true },
  });
  if (!attachment || attachment.post.authorId !== author.id) throw new Error('Not found');

  await prisma.postAttachment.delete({ where: { id: attachmentId } });

  await deleteCloudinaryAsset(attachment.url, resourceTypeForMime(attachment.mimeType)).catch(
    (error: unknown) => {
      console.error('Failed to delete attachment from Cloudinary', error);
    }
  );

  if (attachment.post.status === 'published') revalidatePath(`/posts/${attachment.post.slug}`);

  return { ok: true };
}
