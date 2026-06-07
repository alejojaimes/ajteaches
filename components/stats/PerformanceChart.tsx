'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PerformancePoint } from '@/lib/db/stats';

const MONTH_OPTIONS = [
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' },
];

type Props = {
  data: PerformancePoint[];
  months: number;
};

export function PerformanceChart({ data, months }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current =
    MONTH_OPTIONS.find((option) => Number(option.value) === months) ?? MONTH_OPTIONS[1]!;

  const setMonths = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('months', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="border-border bg-card rounded-card border p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-foreground text-lg font-bold">Performance Over Time</h2>
        <DropdownMenu>
          <DropdownMenuTrigger className="border-border text-foreground hover:border-primary rounded-button flex items-center gap-1.5 border px-3 py-1.5 text-sm font-medium transition-colors outline-none">
            {current.label}
            <ChevronDown className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {MONTH_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => setMonths(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="performance-views-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="performance-reads-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--color-muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                fontSize: 13,
              }}
              labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="views"
              name="Views"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#performance-views-fill)"
            />
            <Area
              type="monotone"
              dataKey="reads"
              name="Reads"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill="url(#performance-reads-fill)"
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
