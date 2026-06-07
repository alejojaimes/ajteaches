import { NextRequest, NextResponse } from 'next/server';
import { EventType } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { getSessionHash } from '@/lib/analytics/session';

const EVENT_TYPES = new Set<string>(Object.values(EventType));

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    postId?: string;
    eventType?: string;
  } | null;
  const postId = body?.postId?.trim();
  const eventType = body?.eventType;

  if (!postId || !eventType || !EVENT_TYPES.has(eventType)) {
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId, status: 'published', deletedAt: null },
    select: { id: true, authorId: true },
  });
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const author = await getCurrentAuthor();
  if (author && author.id === post.authorId) {
    return NextResponse.json({ ok: true, tracked: false });
  }

  const sessionHash = await getSessionHash();

  const existing = await prisma.postEvent.findFirst({
    where: { postId, sessionHash, eventType: eventType as EventType },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ ok: true, tracked: false });

  await prisma.postEvent.create({
    data: { postId, sessionHash, eventType: eventType as EventType },
  });

  return NextResponse.json({ ok: true, tracked: true });
}
