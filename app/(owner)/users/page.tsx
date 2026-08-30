import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import {
  getReaders,
  getReadersOverview,
  getReadersWithoutEmailCount,
  READERS_PAGE_SIZE_OPTIONS,
  DEFAULT_READERS_PAGE_SIZE,
} from '@/lib/db/readers';
import { getEmailTemplates } from '@/lib/actions/email-templates';
import { UsersList } from '@/components/users/UsersList';
import { MetricCard } from '@/components/stats/MetricCard';
import { SearchBar } from '@/components/blog/SearchBar';

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parsePageSize(value: string | undefined): number {
  const size = Number(value);
  return READERS_PAGE_SIZE_OPTIONS.includes(size as (typeof READERS_PAGE_SIZE_OPTIONS)[number])
    ? size
    : DEFAULT_READERS_PAGE_SIZE;
}

type Props = {
  searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const params = await searchParams;
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);
  const query = params.q?.trim() || undefined;

  const [{ readers, hasMore, total }, overview, noEmailCount, templates] = await Promise.all([
    getReaders(page, pageSize, query),
    getReadersOverview(),
    getReadersWithoutEmailCount(),
    getEmailTemplates(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = (page - 1) * pageSize + readers.length;

  const linkFor = (overrides: { page?: number; pageSize?: number }) => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    next.set('pageSize', String(overrides.pageSize ?? pageSize));
    next.set('page', String(overrides.page ?? page));
    return `/users?${next.toString()}`;
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-foreground text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Readers who have signed up to ajteaches.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          label="Total users"
          value={overview.total.value.toLocaleString('en-US')}
          trend={overview.total.trend}
          trendLabel="vs 30 days ago"
          sparkline={overview.total.sparkline}
          color="var(--color-primary)"
        />
        <MetricCard
          label="New this month"
          value={overview.newLastMonth.value.toLocaleString('en-US')}
          trend={overview.newLastMonth.trend}
          trendLabel="vs previous 30 days"
          sparkline={overview.newLastMonth.sparkline}
          color="var(--color-accent)"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Suspense>
          <SearchBar
            initialQuery={query ?? ''}
            placeholder="Search users by name or email…"
            className="w-full max-w-xs"
          />
        </Suspense>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Per page</span>
          <div className="bg-primary-soft/50 rounded-button flex gap-1 p-1">
            {READERS_PAGE_SIZE_OPTIONS.map((size) => (
              <Link
                key={size}
                href={linkFor({ pageSize: size, page: 1 })}
                className={`rounded-button px-2.5 py-1 text-xs font-medium transition-colors ${
                  pageSize === size
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <UsersList
        readers={readers}
        templates={templates}
        ownerEmail={author.email}
        noEmailCount={noEmailCount}
        searchActive={!!query}
      />

      {total > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            Showing {rangeStart}–{rangeEnd} of {total} users
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={linkFor({ page: page - 1 })}
                className="rounded-button border-border text-foreground hover:border-primary hover:text-primary border px-4 py-1.5 text-sm font-medium transition-colors"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded-button border-border text-muted-foreground border px-4 py-1.5 text-sm font-medium opacity-50">
                Previous
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              Page {page} of {totalPages}
            </span>
            {hasMore ? (
              <Link
                href={linkFor({ page: page + 1 })}
                className="rounded-button border-border text-foreground hover:border-primary hover:text-primary border px-4 py-1.5 text-sm font-medium transition-colors"
              >
                Next
              </Link>
            ) : (
              <span className="rounded-button border-border text-muted-foreground border px-4 py-1.5 text-sm font-medium opacity-50">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
