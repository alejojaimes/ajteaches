import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/client';

export async function getCurrentReader() {
  const { userId } = await auth();
  if (!userId) return null;

  // The owner interacts with their own posts as an author, not as a reader —
  // mirrors the exclusion in /api/track that skips events from the post's author.
  const ownAuthor = await prisma.author.findUnique({ where: { clerkUserId: userId } });
  if (ownAuthor) return null;

  let reader = await prisma.reader.findUnique({ where: { clerkUserId: userId } });
  if (reader) return reader;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'Reader';
  reader = await prisma.reader.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      name,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      avatar: clerkUser.imageUrl,
    },
    update: { name, avatar: clerkUser.imageUrl },
  });

  return reader;
}
