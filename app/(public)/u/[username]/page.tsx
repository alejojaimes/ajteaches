import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { ShareProfileButton } from '@/components/profile/ShareProfileButton';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const author = await prisma.author.findUnique({ where: { username } });
  if (!author) notFound();

  const joinedDate = author.createdAt.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Banner + avatar */}
      <div className="relative">
        <div className="rounded-card bg-primary h-36" />
        <div className="absolute -bottom-12 left-8">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
            />
          ) : (
            <div className="bg-primary flex h-24 w-24 items-center justify-center rounded-full border-4 border-white shadow-md">
              <span className="text-2xl font-bold text-white">
                {author.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toLowerCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="mt-16 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold">{author.name}</h1>
            {author.isOwner && (
              <span className="rounded-badge bg-primary-soft text-primary px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
                Creator
              </span>
            )}
          </div>
          {author.username && <p className="text-muted-foreground text-sm">@{author.username}</p>}
          {(author.location || joinedDate) && (
            <p className="text-muted-foreground mt-1 text-sm">
              {author.location && <span>{author.location}</span>}
              {author.location && <span className="mx-2">·</span>}
              <span>Joined {joinedDate}</span>
            </p>
          )}
        </div>
        <ShareProfileButton />
      </div>

      {/* Bio */}
      {author.bio && (
        <div className="border-primary bg-primary-soft/40 rounded-card mt-5 border-l-2 px-4 py-3">
          <p className="text-foreground text-sm leading-relaxed">{author.bio}</p>
        </div>
      )}

      {/* Roles */}
      {author.roles.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {author.roles.map((role) => (
            <span
              key={role}
              className="rounded-badge bg-primary-soft text-primary px-2.5 py-1 text-xs font-medium"
            >
              {role}
            </span>
          ))}
        </div>
      )}

      {/* Interests */}
      {author.interests.length > 0 && (
        <div className="mt-6">
          <h2 className="text-foreground mb-2 text-sm font-semibold">My Interests</h2>
          <div className="flex flex-wrap gap-2">
            {author.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-badge bg-accent/10 text-accent px-2.5 py-1 text-xs font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info links */}
      <div className="border-border bg-card rounded-card mt-6 border p-5">
        <h2 className="text-foreground mb-3 text-sm font-semibold">Information</h2>
        <div className="space-y-3">
          {author.website && (
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-sm"
            >
              <span className="bg-primary-soft flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                {/* Globe icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </span>
              <span>
                <span className="text-muted-foreground block text-xs">Website</span>
                <span className="text-foreground group-hover:text-primary truncate transition-colors">
                  {author.website.replace(/^https?:\/\//, '')}
                </span>
              </span>
            </a>
          )}

          {author.email && (
            <a href={`mailto:${author.email}`} className="group flex items-center gap-3 text-sm">
              <span className="bg-primary-soft flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                {/* Mail icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary h-4 w-4"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <span>
                <span className="text-muted-foreground block text-xs">Email</span>
                <span className="text-foreground group-hover:text-primary truncate transition-colors">
                  {author.email}
                </span>
              </span>
            </a>
          )}

          {author.githubUrl && (
            <a
              href={author.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#181717]/10">
                {/* GitHub logo */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 text-[#181717]"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                </svg>
              </span>
              <span>
                <span className="text-muted-foreground block text-xs">GitHub</span>
                <span className="text-foreground group-hover:text-primary truncate transition-colors">
                  {author.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                </span>
              </span>
            </a>
          )}

          {author.linkedinUrl && (
            <a
              href={author.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10">
                {/* LinkedIn logo */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 text-[#0A66C2]"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
                </svg>
              </span>
              <span>
                <span className="text-muted-foreground block text-xs">LinkedIn</span>
                <span className="text-foreground group-hover:text-primary truncate transition-colors">
                  {author.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                </span>
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
