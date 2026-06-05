import Link from 'next/link';

export function Header() {
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
          <Link
            href="/sign-in"
            className="rounded-button border-primary text-primary hover:bg-primary-soft border px-3 py-1 text-sm"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
