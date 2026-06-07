'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LifetimePostStats } from '@/lib/db/stats';

type SortKey = 'views' | 'reads' | 'readRate';

const PREVIEW_COUNT = 5;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'views', label: 'Views' },
  { key: 'reads', label: 'Reads' },
  { key: 'readRate', label: 'Read Rate (%)' },
];

type Props = {
  posts: LifetimePostStats[];
};

export function LifetimeTable({ posts }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('views');
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () => [...posts].sort((a, b) => b[sortKey] - a[sortKey]),
    [posts, sortKey]
  );
  const visible = expanded ? sorted : sorted.slice(0, PREVIEW_COUNT);

  const handleExport = () => {
    const header = ['Post Title', 'Views', 'Reads', 'Read Rate (%)'];
    const rows = sorted.map((post) => [post.title, post.views, post.reads, post.readRate]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ajteaches-lifetime-stats.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (posts.length === 0) {
    return (
      <div className="border-border bg-card rounded-card border p-10 text-center">
        <h2 className="text-foreground mb-1 text-lg font-bold">Lifetime by Post</h2>
        <p className="text-muted-foreground text-sm">
          Publish your first post to start tracking views and reads here.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-card overflow-hidden border">
      <div className="flex items-center justify-between gap-3 px-6 py-5">
        <h2 className="text-foreground text-lg font-bold">Lifetime by Post</h2>
        <button
          type="button"
          onClick={handleExport}
          className="text-primary hover:text-primary-hover text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border bg-primary-soft/40 border-y">
              <th className="text-muted-foreground px-6 py-2.5 text-xs font-semibold tracking-wide uppercase">
                Post Title
              </th>
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-6 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => setSortKey(column.key)}
                    className={`text-xs font-semibold tracking-wide uppercase transition-colors ${
                      sortKey === column.key
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {column.label} {sortKey === column.key && '↓'}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((post) => (
              <tr key={post.id} className="border-border border-b last:border-b-0">
                <td className="text-foreground px-6 py-3.5 font-medium">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="text-foreground px-6 py-3.5 text-right tabular-nums">
                  {post.views.toLocaleString('en-US')}
                </td>
                <td className="text-foreground px-6 py-3.5 text-right tabular-nums">
                  {post.reads.toLocaleString('en-US')}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <span
                    className={`rounded-badge px-2 py-0.5 text-xs font-semibold ${
                      post.readRate >= 75
                        ? 'bg-emerald-50 text-emerald-700'
                        : post.readRate < 60
                          ? 'text-destructive bg-red-50'
                          : 'text-foreground'
                    }`}
                  >
                    {post.readRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-primary hover:text-primary-hover bg-primary-soft/30 hover:bg-primary-soft/50 w-full py-3 text-center text-sm font-medium transition-colors"
        >
          {expanded ? 'Show less' : `View All ${sorted.length} Posts`}
        </button>
      )}
    </div>
  );
}
