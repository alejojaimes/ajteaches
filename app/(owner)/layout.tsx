import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { OwnerSidebar } from '@/components/layout/OwnerSidebar';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  return (
    <>
      <Header />
      <div className="mx-auto flex max-w-7xl">
        <OwnerSidebar
          author={{ name: author.name, username: author.username, avatar: author.avatar }}
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
