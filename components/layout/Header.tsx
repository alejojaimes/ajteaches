import { prisma } from '@/lib/db/client';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { getServerDictionary } from '@/lib/i18n/get-locale';
import { HeaderNav } from './HeaderNav';

export async function Header() {
  const [owner, reader, t] = await Promise.all([
    prisma.author.findFirst({
      where: { username: { not: null } },
      orderBy: { isOwner: 'desc' },
      select: { username: true },
    }),
    getCurrentReader(),
    getServerDictionary(),
  ]);

  const links = [
    { href: '/?type=blog', label: t.nav.blog },
    { href: '/?type=tutorial', label: t.nav.tutorials },
    ...(owner?.username ? [{ href: `/u/${owner.username}`, label: t.nav.about }] : []),
  ];

  return (
    <HeaderNav
      links={links}
      reader={reader ? { name: reader.name, avatar: reader.avatar } : null}
      signInLabel={t.nav.signIn}
      accountLabel={t.nav.account}
    />
  );
}
