'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { Trend } from '@/lib/db/stats';

type Props = {
  label: string;
  value: string;
  trend: Trend;
  trendLabel: string;
  sparkline: number[];
  color: string;
};

const TREND_STYLES: Record<Trend['direction'], { className: string; arrow: string }> = {
  up: { className: 'text-emerald-600', arrow: '↗' },
  down: { className: 'text-destructive', arrow: '↘' },
  flat: { className: 'text-muted-foreground', arrow: '→' },
};

export function MetricCard({ label, value, trend, trendLabel, sparkline, color }: Props) {
  const gradientId = `metric-spark-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const data = sparkline.map((v, i) => ({ i, v }));
  const { className, arrow } = TREND_STYLES[trend.direction];

  return (
    <div className="border-border bg-card rounded-card border p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {label}
        </span>
        <div className="h-8 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-foreground mt-2 text-3xl font-bold">{value}</p>
      <p className={`mt-1 text-xs font-medium ${className}`}>
        {arrow} {trend.direction === 'flat' ? 'No change' : `${trend.percent}%`} {trendLabel}
      </p>
    </div>
  );
}
