import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { getReaders, READERS_PAGE_SIZE } from '@/lib/db/readers';
import { getEmailTemplates } from '@/lib/actions/email-templates';
import { UsersList } from '@/components/users/UsersList';

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const params = await searchParams;
  const page = parsePage(params.page);

  const [{ readers, hasMore }, templates] = await Promise.all([
    getReaders(page),
    getEmailTemplates(),
  ]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-foreground text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Readers who have signed up to ajteaches.
        </p>
      </header>

      <UsersList readers={readers} templates={templates} />

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/users?page=${page + 1}`}
            className="rounded-button border-border text-foreground hover:border-primary hover:text-primary border px-5 py-2 text-sm font-medium transition-colors"
          >
            Load more
          </Link>
        </div>
      )}

      {readers.length > 0 && !hasMore && readers.length > READERS_PAGE_SIZE && (
        <p className="text-muted-foreground mt-8 text-center text-xs">
          You&apos;ve reached the end — {readers.length} users total.
        </p>
      )}
    </div>
  );
}
