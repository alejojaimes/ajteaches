import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import {
  getLifetimeByPost,
  getPerformanceSeries,
  getStatsOverview,
  type StatsRange,
} from '@/lib/db/stats';
import { Reveal } from '@/components/profile/Reveal';
import { MetricCard } from '@/components/stats/MetricCard';
import { PerformanceChart } from '@/components/stats/PerformanceChart';
import { LifetimeTable } from '@/components/stats/LifetimeTable';

const RANGE_OPTIONS: { value: StatsRange; label: string }[] = [
  { value: '30d', label: 'Last 30 Days' },
  { value: 'ytd', label: 'Year to Date' },
];

const RANGE_TREND_LABEL: Record<StatsRange, string> = {
  '30d': 'vs previous 30 days',
  ytd: 'vs same period last year',
};

const MONTH_PRESETS = [3, 6, 12];

function formatCount(value: number): string {
  if (value < 1000) return value.toLocaleString('en-US');
  return `${(value / 1000).toFixed(1)}k`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; months?: string }>;
}) {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const { range: rawRange, months: rawMonths } = await searchParams;
  const range: StatsRange = rawRange === 'ytd' ? 'ytd' : '30d';
  const parsedMonths = Number(rawMonths);
  const months = MONTH_PRESETS.includes(parsedMonths) ? parsedMonths : 6;

  const [overview, series, lifetime] = await Promise.all([
    getStatsOverview(author.id, range),
    getPerformanceSeries(author.id, months),
    getLifetimeByPost(author.id),
  ]);

  const trendLabel = RANGE_TREND_LABEL[range];

  return (
    <div>
      <Reveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Analytics Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time performance metrics for your technical writing.
          </p>
        </div>
        <div className="bg-primary-soft/50 rounded-button flex gap-1 p-1">
          {RANGE_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/stats?range=${option.value}`}
              className={`rounded-button px-3 py-1.5 text-sm font-medium transition-colors ${
                range === option.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Posts"
          value={overview.posts.value.toLocaleString('en-US')}
          trend={overview.posts.trend}
          trendLabel={trendLabel}
          sparkline={overview.posts.sparkline}
          color="var(--color-primary)"
        />
        <MetricCard
          label="Views"
          value={formatCount(overview.views.value)}
          trend={overview.views.trend}
          trendLabel={trendLabel}
          sparkline={overview.views.sparkline}
          color="var(--color-primary)"
        />
        <MetricCard
          label="Reads"
          value={formatCount(overview.reads.value)}
          trend={overview.reads.trend}
          trendLabel={trendLabel}
          sparkline={overview.reads.sparkline}
          color="var(--color-accent)"
        />
        <MetricCard
          label="Avg. read time"
          value={formatDuration(overview.avgReadDuration.value)}
          trend={overview.avgReadDuration.trend}
          trendLabel={trendLabel}
          sparkline={overview.avgReadDuration.sparkline}
          color="var(--color-accent)"
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <PerformanceChart data={series} months={months} />
      </Reveal>

      <Reveal delay={0.15} className="mt-6">
        <LifetimeTable posts={lifetime} />
      </Reveal>
    </div>
  );
}
