import type { EventType } from '@prisma/client';
import { prisma } from './client';

export type StatsRange = '30d' | 'ytd';

export type Trend = {
  percent: number;
  direction: 'up' | 'down' | 'flat';
};

export type OverviewMetric = {
  value: number;
  trend: Trend;
  sparkline: number[];
};

export type StatsOverview = {
  posts: OverviewMetric;
  views: OverviewMetric;
  reads: OverviewMetric;
  avgReadDuration: OverviewMetric;
};

export type PerformancePoint = {
  month: string;
  views: number;
  reads: number;
};

export type LifetimePostStats = {
  id: string;
  title: string;
  slug: string;
  views: number;
  reads: number;
  readRate: number;
  likes: number;
  saves: number;
};

const SPARKLINE_DAYS = 14;
const READ_EVENT: EventType = 'read_70';
const VIEW_EVENT: EventType = 'view';
const ENGAGEMENT_END_EVENT: EventType = 'engagement_end';

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

function getRangeWindows(range: StatsRange, now: Date) {
  if (range === 'ytd') {
    return {
      currentStart: new Date(now.getFullYear(), 0, 1),
      previousStart: new Date(now.getFullYear() - 1, 0, 1),
      previousEnd: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    };
  }
  return {
    currentStart: addDays(now, -30),
    previousStart: addDays(now, -60),
    previousEnd: addDays(now, -30),
  };
}

function trendOf(current: number, previous: number): Trend {
  if (previous === 0) {
    return current === 0 ? { percent: 0, direction: 'flat' } : { percent: 100, direction: 'up' };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { percent: 0, direction: 'flat' };
  return { percent: Math.abs(percent), direction: percent > 0 ? 'up' : 'down' };
}

function countEvents(
  postIds: string[],
  eventType: EventType,
  window?: { gte?: Date; lt?: Date }
): Promise<number> {
  if (postIds.length === 0) return Promise.resolve(0);
  return prisma.postEvent.count({
    where: {
      postId: { in: postIds },
      eventType,
      ...(window
        ? {
            createdAt: {
              ...(window.gte ? { gte: window.gte } : {}),
              ...(window.lt ? { lt: window.lt } : {}),
            },
          }
        : {}),
    },
  });
}

async function getDailySparkline(
  postIds: string[],
  eventType: EventType,
  now: Date
): Promise<number[]> {
  const since = startOfDay(addDays(now, -(SPARKLINE_DAYS - 1)));
  if (postIds.length === 0) return Array<number>(SPARKLINE_DAYS).fill(0);

  const events = await prisma.postEvent.findMany({
    where: { postId: { in: postIds }, eventType, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const buckets = Array<number>(SPARKLINE_DAYS).fill(0);
  for (const event of events) {
    const dayIndex = Math.floor(
      (startOfDay(event.createdAt).getTime() - since.getTime()) / 86_400_000
    );
    if (dayIndex >= 0 && dayIndex < SPARKLINE_DAYS)
      buckets[dayIndex] = (buckets[dayIndex] ?? 0) + 1;
  }
  return buckets;
}

function getDailyPostsSparkline(posts: { publishedAt: Date | null }[], now: Date): number[] {
  const since = startOfDay(addDays(now, -(SPARKLINE_DAYS - 1)));
  const buckets = Array<number>(SPARKLINE_DAYS).fill(0);
  for (const post of posts) {
    if (!post.publishedAt) continue;
    const dayIndex = Math.floor(
      (startOfDay(post.publishedAt).getTime() - since.getTime()) / 86_400_000
    );
    if (dayIndex >= 0 && dayIndex < SPARKLINE_DAYS)
      buckets[dayIndex] = (buckets[dayIndex] ?? 0) + 1;
  }
  return buckets;
}

async function getAvgDurationMs(
  postIds: string[],
  window?: { gte?: Date; lt?: Date }
): Promise<number> {
  if (postIds.length === 0) return 0;
  const { _avg } = await prisma.postEvent.aggregate({
    where: {
      postId: { in: postIds },
      eventType: ENGAGEMENT_END_EVENT,
      durationMs: { not: null },
      ...(window
        ? {
            createdAt: {
              ...(window.gte ? { gte: window.gte } : {}),
              ...(window.lt ? { lt: window.lt } : {}),
            },
          }
        : {}),
    },
    _avg: { durationMs: true },
  });
  return Math.round(_avg.durationMs ?? 0);
}

async function getDailyAvgDurationSparkline(postIds: string[], now: Date): Promise<number[]> {
  const since = startOfDay(addDays(now, -(SPARKLINE_DAYS - 1)));
  if (postIds.length === 0) return Array<number>(SPARKLINE_DAYS).fill(0);

  const events = await prisma.postEvent.findMany({
    where: {
      postId: { in: postIds },
      eventType: ENGAGEMENT_END_EVENT,
      durationMs: { not: null },
      createdAt: { gte: since },
    },
    select: { createdAt: true, durationMs: true },
  });

  const sums = Array<number>(SPARKLINE_DAYS).fill(0);
  const counts = Array<number>(SPARKLINE_DAYS).fill(0);
  for (const event of events) {
    if (event.durationMs === null) continue;
    const dayIndex = Math.floor(
      (startOfDay(event.createdAt).getTime() - since.getTime()) / 86_400_000
    );
    if (dayIndex >= 0 && dayIndex < SPARKLINE_DAYS) {
      sums[dayIndex] = (sums[dayIndex] ?? 0) + event.durationMs;
      counts[dayIndex] = (counts[dayIndex] ?? 0) + 1;
    }
  }
  return sums.map((sum, i) => {
    const count = counts[i] ?? 0;
    return count > 0 ? Math.round(sum / count) : 0;
  });
}

export async function getStatsOverview(
  authorId: string,
  range: StatsRange
): Promise<StatsOverview> {
  const now = new Date();
  const { currentStart, previousStart, previousEnd } = getRangeWindows(range, now);

  const posts = await prisma.post.findMany({
    where: { authorId, status: 'published', deletedAt: null },
    select: { id: true, publishedAt: true },
  });
  const postIds = posts.map((post) => post.id);

  const currentPosts = posts.filter(
    (post) => post.publishedAt && post.publishedAt >= currentStart
  ).length;
  const previousPosts = posts.filter(
    (post) =>
      post.publishedAt && post.publishedAt >= previousStart && post.publishedAt < previousEnd
  ).length;

  const [
    totalViews,
    totalReads,
    currentViews,
    previousViews,
    currentReads,
    previousReads,
    viewsSparkline,
    readsSparkline,
    currentAvgDuration,
    previousAvgDuration,
    avgDurationSparkline,
  ] = await Promise.all([
    countEvents(postIds, VIEW_EVENT),
    countEvents(postIds, READ_EVENT),
    countEvents(postIds, VIEW_EVENT, { gte: currentStart }),
    countEvents(postIds, VIEW_EVENT, { gte: previousStart, lt: previousEnd }),
    countEvents(postIds, READ_EVENT, { gte: currentStart }),
    countEvents(postIds, READ_EVENT, { gte: previousStart, lt: previousEnd }),
    getDailySparkline(postIds, VIEW_EVENT, now),
    getDailySparkline(postIds, READ_EVENT, now),
    getAvgDurationMs(postIds, { gte: currentStart }),
    getAvgDurationMs(postIds, { gte: previousStart, lt: previousEnd }),
    getDailyAvgDurationSparkline(postIds, now),
  ]);

  return {
    posts: {
      value: posts.length,
      trend: trendOf(currentPosts, previousPosts),
      sparkline: getDailyPostsSparkline(posts, now),
    },
    views: {
      value: totalViews,
      trend: trendOf(currentViews, previousViews),
      sparkline: viewsSparkline,
    },
    reads: {
      value: totalReads,
      trend: trendOf(currentReads, previousReads),
      sparkline: readsSparkline,
    },
    avgReadDuration: {
      value: currentAvgDuration,
      trend: trendOf(currentAvgDuration, previousAvgDuration),
      sparkline: avgDurationSparkline,
    },
  };
}

export async function getPerformanceSeries(
  authorId: string,
  months = 6
): Promise<PerformancePoint[]> {
  const posts = await prisma.post.findMany({
    where: { authorId, deletedAt: null },
    select: { id: true },
  });
  const postIds = posts.map((post) => post.id);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const buckets = Array.from({ length: months }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      views: 0,
      reads: 0,
    };
  });

  if (postIds.length > 0) {
    const events = await prisma.postEvent.findMany({
      where: {
        postId: { in: postIds },
        eventType: { in: [VIEW_EVENT, READ_EVENT] },
        createdAt: { gte: start },
      },
      select: { eventType: true, createdAt: true },
    });

    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    for (const event of events) {
      const key = `${event.createdAt.getFullYear()}-${event.createdAt.getMonth()}`;
      const bucket = byKey.get(key);
      if (!bucket) continue;
      if (event.eventType === VIEW_EVENT) bucket.views += 1;
      else bucket.reads += 1;
    }
  }

  return buckets.map(({ month, views, reads }) => ({ month, views, reads }));
}

export async function getLifetimeByPost(authorId: string): Promise<LifetimePostStats[]> {
  const posts = await prisma.post.findMany({
    where: { authorId, status: 'published', deletedAt: null },
    select: { id: true, title: true, slug: true },
  });
  if (posts.length === 0) return [];

  const postIds = posts.map((post) => post.id);
  const [viewCounts, readCounts, likeCounts, saveCounts] = await Promise.all([
    prisma.postEvent.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds }, eventType: VIEW_EVENT },
      _count: { _all: true },
    }),
    prisma.postEvent.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds }, eventType: READ_EVENT },
      _count: { _all: true },
    }),
    prisma.postLike.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: { _all: true },
    }),
    prisma.savedPost.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _count: { _all: true },
    }),
  ]);

  const viewsByPost = new Map(viewCounts.map((row) => [row.postId, row._count._all]));
  const readsByPost = new Map(readCounts.map((row) => [row.postId, row._count._all]));
  const likesByPost = new Map(likeCounts.map((row) => [row.postId, row._count._all]));
  const savesByPost = new Map(saveCounts.map((row) => [row.postId, row._count._all]));

  return posts
    .map((post) => {
      const views = viewsByPost.get(post.id) ?? 0;
      const reads = readsByPost.get(post.id) ?? 0;
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        views,
        reads,
        readRate: views > 0 ? Math.round((reads / views) * 100) : 0,
        likes: likesByPost.get(post.id) ?? 0,
        saves: savesByPost.get(post.id) ?? 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}
