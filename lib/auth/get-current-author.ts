import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/client';

export async function getCurrentAuthor() {
  const { userId } = await auth();
  if (!userId) return null;

  let author = await prisma.author.findUnique({
    where: { clerkUserId: userId },
  });

  if (!author) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const existingOwner = await prisma.author.findFirst({
      where: { isOwner: true, clerkUserId: null },
    });

    if (existingOwner) {
      author = await prisma.author.update({
        where: { id: existingOwner.id },
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
        },
      });
    } else {
      author = await prisma.author.create({
        data: {
          clerkUserId: userId,
          name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
          email: clerkUser.emailAddresses[0]?.emailAddress,
          isOwner: true,
        },
      });
    }
  }

  return author;
}
