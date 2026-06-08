'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

type NavLink = { href: string; label: string };

type Props = {
  links: NavLink[];
  reader: { name: string; avatar: string | null } | null;
  signInLabel: string;
  accountLabel: string;
};

function isActive(href: string, pathname: string): boolean {
  const [hrefPath] = href.split('?');
  if (hrefPath === '/') return pathname === '/';
  return hrefPath === pathname;
}

export function HeaderNav({ links, reader, signInLabel, accountLabel }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
            aj
          </div>
          <span className="text-foreground font-medium">ajteaches</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="bg-primary absolute right-3 -bottom-[1px] left-3 h-[2px] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />

          <div className="ml-1 hidden items-center md:flex">
            {reader ? (
              <Link
                href="/account"
                className="hover:bg-muted flex items-center gap-2 rounded-full p-1 pr-3 transition-colors"
              >
                <Avatar size="sm">
                  {reader.avatar && <AvatarImage src={reader.avatar} alt={reader.name} />}
                  <AvatarFallback className="text-[10px]">
                    {getInitials(reader.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground text-sm font-medium">{accountLabel}</span>
              </Link>
            ) : (
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
                className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                {signInLabel}
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="text-muted-foreground hover:text-foreground hover:bg-muted ml-1 flex size-9 items-center justify-center rounded-full transition-colors md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-border/60 overflow-hidden border-t md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    isActive(link.href, pathname)
                      ? 'bg-primary-soft text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {reader ? (
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <Avatar size="sm">
                    {reader.avatar && <AvatarImage src={reader.avatar} alt={reader.name} />}
                    <AvatarFallback className="text-[10px]">
                      {getInitials(reader.name)}
                    </AvatarFallback>
                  </Avatar>
                  {accountLabel}
                </Link>
              ) : (
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
                  onClick={() => setMenuOpen(false)}
                  className="bg-primary hover:bg-primary-hover rounded-button mt-1 px-3 py-2 text-center text-sm font-medium text-white transition-colors"
                >
                  {signInLabel}
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
