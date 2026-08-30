import { Star, ExternalLink, Folder } from 'lucide-react';
import type { GithubRepoSnapshot } from '@/lib/actions/posts';

type Props = {
  url: string;
  repo: GithubRepoSnapshot;
  badgeLabel: string;
  ctaLabel: string;
};

/** Folder or file path a `/tree/<branch>/...` or `/blob/<branch>/...` URL points at, if any. */
export function extractRepoPath(url: string, fullName: string): string | null {
  const prefix = `https://github.com/${fullName}`;
  if (!url.startsWith(prefix)) return null;
  const match = /^\/(?:tree|blob)\/[^/]+\/(.+)$/.exec(url.slice(prefix.length));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function GithubRepoCard({ url, repo, badgeLabel, ctaLabel }: Props) {
  const path = extractRepoPath(url, repo.fullName);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border bg-card hover:border-primary/50 group focus-visible:ring-primary mb-8 block rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
        </svg>
        {badgeLabel}
      </div>

      <div className="flex items-start gap-3">
        {repo.ownerAvatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={repo.ownerAvatar} alt="" className="h-10 w-10 shrink-0 rounded-full" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">{repo.fullName}</p>
          {path && (
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-xs">
              <Folder className="h-3 w-3 shrink-0" />
              {path}
            </p>
          )}
          {repo.description && (
            <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">{repo.description}</p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {repo.language && (
              <span className="rounded-badge bg-primary-soft text-primary px-2 py-0.5 text-xs font-semibold">
                {repo.language}
              </span>
            )}
            {repo.license && (
              <span className="rounded-badge bg-primary-soft text-primary px-2 py-0.5 text-xs font-semibold">
                {repo.license}
              </span>
            )}
            <span className="rounded-badge bg-primary-soft text-primary flex items-center gap-1 px-2 py-0.5 text-xs font-semibold">
              <Star className="h-3 w-3" />
              {repo.stars.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      <div className="border-border text-primary mt-3 flex items-center gap-1.5 border-t pt-3 text-sm font-medium">
        {ctaLabel}
        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}
