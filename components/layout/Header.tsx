import Link from 'next/link';
import { prisma } from '@/lib/db/client';

export async function Header() {
  const owner = await prisma.author.findFirst({
    where: { isOwner: true },
    select: { username: true },
  });

  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
            aj
          </div>
          <span className="text-foreground font-medium">ajteaches</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/?type=blog" className="text-muted-foreground hover:text-foreground text-sm">
            Blog
          </Link>
          <Link
            href="/?type=tutorial"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Tutorials
          </Link>
          {owner?.username && (
            <Link
              href={`/u/${owner.username}`}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              About
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
