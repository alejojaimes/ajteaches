import type { GithubRepoSnapshot } from '@/lib/actions/posts';

type Props = {
  url: string;
  repo: GithubRepoSnapshot;
};

export function GithubRepoCard({ url, repo }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border bg-card hover:border-primary/50 mb-8 flex items-start gap-3 rounded-xl border p-4 transition-colors"
    >
      {repo.ownerAvatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={repo.ownerAvatar} alt="" className="h-10 w-10 shrink-0 rounded-full" />
      )}
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-semibold">{repo.fullName}</p>
        {repo.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{repo.description}</p>
        )}
        <p className="text-muted-foreground mt-2 text-xs">
          {repo.language && <span>{repo.language} · </span>}⭐ {repo.stars.toLocaleString('en-US')}
        </p>
      </div>
    </a>
  );
}
