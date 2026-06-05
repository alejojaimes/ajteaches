import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/client';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;
  const author = await getCurrentAuthor();
  if (!author) return NextResponse.json({ error: 'Author not found' }, { status: 403 });

  const post = await prisma.post.findUnique({ where: { id: postId, deletedAt: null } });
  if (!post || post.authorId !== author.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.draftShareLink.updateMany({
    where: { postId, revoked: false },
    data: { revoked: true },
  });

  const token = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  await prisma.draftShareLink.create({ data: { postId, token, expiresAt } });

  const origin = req.nextUrl.origin;
  return NextResponse.json({ url: `${origin}/preview/${token}` });
}
