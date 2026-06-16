'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  BarChart3,
  MessageCircle,
  Users,
  User,
  LogOut,
  FolderTree,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed', icon: LayoutDashboard },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/comments', label: 'Comments', icon: MessageCircle },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/collections', label: 'Collections', icon: FolderTree },
  { href: '/email-templates', label: 'Email templates', icon: Mail },
  { href: '/profile', label: 'Profile', icon: User },
];

type Props = {
  author: {
    name: string;
    username: string | null;
    avatar: string | null;
  };
};

export function OwnerSidebar({ author }: Props) {
  const pathname = usePathname();

  return (
    <aside className="border-border flex w-60 shrink-0 flex-col border-r p-4">
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-button flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-soft text-primary'
                  : 'text-muted-foreground hover:bg-primary-soft hover:text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border mt-auto flex items-center gap-2.5 border-t pt-4">
        <Avatar>
          {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
          <AvatarFallback className="bg-primary text-xs font-bold text-white">aj</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-medium">{author.name}</p>
          {author.username && (
            <p className="text-muted-foreground truncate text-xs">@{author.username}</p>
          )}
        </div>
        <SignOutButton>
          <button
            type="button"
            aria-label="Sign out"
            className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
