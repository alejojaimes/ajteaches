import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { ProfileEditor } from '@/components/profile/ProfileEditor';

export default async function ProfilePage() {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        {/* Avatar display */}
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="bg-primary flex h-20 w-20 items-center justify-center rounded-full">
            <span className="text-xl font-bold text-white">aj</span>
          </div>
        )}
        <div>
          <h1 className="text-foreground text-2xl font-bold">{author.name}</h1>
          {author.username && <p className="text-muted-foreground text-sm">@{author.username}</p>}
        </div>
      </div>

      <ProfileEditor author={author} />
    </div>
  );
}
