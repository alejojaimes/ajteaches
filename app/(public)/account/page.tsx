import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/client';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ReaderProfileForm } from '@/components/account/ReaderProfileForm';
import { NewsletterToggle } from '@/components/account/NewsletterToggle';
import { getInitials } from '@/lib/utils';

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const isAuthor = await prisma.author.findUnique({ where: { clerkUserId: userId } });
  if (isAuthor) redirect('/feed');

  const reader = await getCurrentReader();
  if (!reader) redirect('/sign-in');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Avatar size="lg">
          {reader.avatar && <AvatarImage src={reader.avatar} alt={reader.name} />}
          <AvatarFallback>{getInitials(reader.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-foreground text-2xl font-bold">{reader.name}</h1>
          {reader.email && <p className="text-muted-foreground text-sm">{reader.email}</p>}
        </div>
      </div>

      <NewsletterToggle initialOptedIn={reader.newsletterOptIn} />

      <Link
        href="/account/saved"
        className="text-primary hover:text-primary-hover mb-8 inline-block text-sm font-medium"
      >
        View saved posts →
      </Link>

      <ReaderProfileForm reader={reader} />
    </div>
  );
}
