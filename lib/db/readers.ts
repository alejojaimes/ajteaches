import { prisma } from './client';
import type { Trend, OverviewMetric } from './stats';

export type ReaderListItem = {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  newsletterOptIn: boolean;
  createdAt: Date;
};

export const READERS_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
export const DEFAULT_READERS_PAGE_SIZE = 5;

function readersSearchWhere(query?: string) {
  if (!query) return {};
  return {
    OR: [
      { name: { contains: query, mode: 'insensitive' as const } },
      { email: { contains: query, mode: 'insensitive' as const } },
    ],
  };
}

export async function getReaders(
  page: number,
  pageSize: number = DEFAULT_READERS_PAGE_SIZE,
  query?: string
): Promise<{ readers: ReaderListItem[]; hasMore: boolean; total: number }> {
  const skip = (page - 1) * pageSize;
  const where = readersSearchWhere(query);

  const [readers, total] = await Promise.all([
    prisma.reader.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        newsletterOptIn: true,
        createdAt: true,
      },
    }),
    prisma.reader.count({ where }),
  ]);

  return { readers, hasMore: skip + readers.length < total, total };
}

/** How many signed-up readers have no email and therefore can't receive messages. */
export async function getReadersWithoutEmailCount(): Promise<number> {
  return prisma.reader.count({ where: { email: null } });
}

export type ReadersOverview = {
  total: OverviewMetric;
  newLastMonth: OverviewMetric;
};

const SPARKLINE_DAYS = 14;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function trendOf(current: number, previous: number): Trend {
  if (previous === 0) {
    return current === 0 ? { percent: 0, direction: 'flat' } : { percent: 100, direction: 'up' };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { percent: 0, direction: 'flat' };
  return { percent: Math.abs(percent), direction: percent > 0 ? 'up' : 'down' };
}

export async function getReadersOverview(): Promise<ReadersOverview> {
  const now = new Date();
  const currentStart = addDays(now, -30);
  const previousStart = addDays(now, -60);
  const sparklineSince = startOfDay(addDays(now, -(SPARKLINE_DAYS - 1)));

  const [
    totalNow,
    totalAtWindowStart,
    totalAtSparklineStart,
    newLastMonth,
    newPreviousMonth,
    recentSignups,
  ] = await Promise.all([
    prisma.reader.count(),
    prisma.reader.count({ where: { createdAt: { lt: currentStart } } }),
    prisma.reader.count({ where: { createdAt: { lt: sparklineSince } } }),
    prisma.reader.count({ where: { createdAt: { gte: currentStart } } }),
    prisma.reader.count({ where: { createdAt: { gte: previousStart, lt: currentStart } } }),
    prisma.reader.findMany({
      where: { createdAt: { gte: sparklineSince } },
      select: { createdAt: true },
    }),
  ]);

  const dailySignups = Array<number>(SPARKLINE_DAYS).fill(0);
  for (const { createdAt } of recentSignups) {
    const dayIndex = Math.floor(
      (startOfDay(createdAt).getTime() - sparklineSince.getTime()) / 86_400_000
    );
    if (dayIndex >= 0 && dayIndex < SPARKLINE_DAYS)
      dailySignups[dayIndex] = (dailySignups[dayIndex] ?? 0) + 1;
  }

  const totalSparkline: number[] = [];
  let running = totalAtSparklineStart;
  for (const count of dailySignups) {
    running += count;
    totalSparkline.push(running);
  }

  return {
    total: {
      value: totalNow,
      trend: trendOf(totalNow, totalAtWindowStart),
      sparkline: totalSparkline,
    },
    newLastMonth: {
      value: newLastMonth,
      trend: trendOf(newLastMonth, newPreviousMonth),
      sparkline: dailySignups,
    },
  };
}
