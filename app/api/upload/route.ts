import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  const scope = (formData.get('scope') as string | null)?.trim();

  if (scope !== 'avatar') {
    const author = await getCurrentAuthor();
    if (!author?.isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

  const isAvatar = scope === 'avatar';
  const isAttachment = scope === 'attachment';
  const postId = (formData.get('postId') as string | null)?.trim() || 'misc';
  const folder = isAvatar
    ? `ajteaches/avatars/${userId}`
    : isAttachment
      ? `ajteaches/attachments/${postId}`
      : `ajteaches/posts/${postId}`;

  if (isAttachment) {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    });
    return NextResponse.json({ url: result.secure_url });
  }

  const transformation = isAvatar
    ? [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ]
    : [{ width: 1200, crop: 'limit' }, { quality: 'auto' }, { fetch_format: 'auto' }];

  const result = await cloudinary.uploader.upload(dataUri, { folder, transformation });

  return NextResponse.json({ url: result.secure_url });
}
