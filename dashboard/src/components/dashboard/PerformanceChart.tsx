import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const data = [
  { date: 'Mon', views: 24000, clicks: 2400, revenue: 12400 },
  { date: 'Tue', views: 28000, clicks: 2800, revenue: 14200 },
  { date: 'Wed', views: 26000, clicks: 2600, revenue: 13800 },
  { date: 'Thu', views: 32000, clicks: 3200, revenue: 16500 },
  { date: 'Fri', views: 35000, clicks: 3500, revenue: 18200 },
  { date: 'Sat', views: 42000, clicks: 4200, revenue: 22100 },
  { date: 'Sun', views: 38000, clicks: 3800, revenue: 19800 },
];

type MetricType = 'revenue' | 'views' | 'clicks';

const metricConfig: Record<MetricType, { color: string; gradient: string; label: string }> = {
  revenue: {
    color: 'hsl(38, 92%, 50%)',
    gradient: 'revenueGradient',
    label: 'Revenue',
  },
  views: {
    color: 'hsl(173, 58%, 39%)',
    gradient: 'viewsGradient',
    label: 'Views',
  },
  clicks: {
    color: 'hsl(199, 89%, 48%)',
    gradient: 'clicksGradient',
    label: 'Clicks',
  },
};

export function PerformanceChart() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue');

  const config = metricConfig[selectedMetric];

  return (
    <div className="bento-card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recommendation Performance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track {config.label.toLowerCase()} from recommendations over time
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={selectedMetric}
          onValueChange={(value) => value && setSelectedMetric(value as MetricType)}
          className="bg-secondary rounded-lg p-1"
        >
          <ToggleGroupItem 
            value="revenue" 
            aria-label="Toggle revenue" 
            className="text-xs px-3 h-7 data-[state=on]:bg-amber-500 data-[state=on]:text-white"
          >
            Revenue
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="views" 
            aria-label="Toggle views" 
            className="text-xs px-3 h-7 data-[state=on]:bg-teal-600 data-[state=on]:text-white"
          >
            Views
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="clicks" 
            aria-label="Toggle clicks" 
            className="text-xs px-3 h-7 data-[state=on]:bg-sky-500 data-[state=on]:text-white"
          >
            Clicks
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={config.gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
              tickFormatter={(value) => 
                selectedMetric === 'revenue' 
                  ? `₹${(value / 1000).toFixed(0)}k` 
                  : `${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [
                selectedMetric === 'revenue' ? `₹${value.toLocaleString()}` : value.toLocaleString(),
                config.label,
              ]}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={config.color}
              strokeWidth={2}
              fill={`url(#${config.gradient})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
        <span className="text-sm text-muted-foreground">{config.label}</span>
      </div>
    </div>
  );
}
