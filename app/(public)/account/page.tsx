import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ReaderProfileForm } from '@/components/account/ReaderProfileForm';

export default async function AccountPage() {
  const reader = await getCurrentReader();
  if (!reader) redirect('/sign-in');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Avatar size="lg">
          {reader.avatar && <AvatarImage src={reader.avatar} alt={reader.name} />}
          <AvatarFallback>{reader.name.slice(0, 2).toLowerCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-foreground text-2xl font-bold">{reader.name}</h1>
          {reader.email && <p className="text-muted-foreground text-sm">{reader.email}</p>}
        </div>
      </div>

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
