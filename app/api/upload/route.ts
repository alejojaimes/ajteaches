import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

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
  const postId = (formData.get('postId') as string | null)?.trim() || 'misc';

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `ajteaches/posts/${postId}`,
    transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }, { fetch_format: 'auto' }],
  });

  return NextResponse.json({ url: result.secure_url });
}
