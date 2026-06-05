import { Header } from '@/components/layout/Header';
import Link from 'next/link';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto flex max-w-7xl">
        <aside className="border-border w-60 border-r p-4">
          <nav className="space-y-1">
            <Link
              href="/feed"
              className="rounded-button text-foreground hover:bg-primary-soft hover:text-primary block px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/stats"
              className="rounded-button text-muted-foreground hover:bg-primary-soft hover:text-primary block px-3 py-2 text-sm"
            >
              Stats
            </Link>
            <Link
              href="/profile"
              className="rounded-button text-muted-foreground hover:bg-primary-soft hover:text-primary block px-3 py-2 text-sm"
            >
              Profile
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
