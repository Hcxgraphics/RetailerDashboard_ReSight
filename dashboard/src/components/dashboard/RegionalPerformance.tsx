import { useState } from 'react';
import { MapPin, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const regionData = {
  all: [
    { region: 'Maharashtra', recommendations: 245000, ctr: 8.2, revenue: 42500 },
    { region: 'Delhi NCR', recommendations: 198000, ctr: 7.8, revenue: 38200 },
    { region: 'Karnataka', recommendations: 175000, ctr: 8.5, revenue: 35800 },
    { region: 'Tamil Nadu', recommendations: 156000, ctr: 7.4, revenue: 28900 },
    { region: 'Gujarat', recommendations: 134000, ctr: 7.1, revenue: 24500 },
    { region: 'West Bengal', recommendations: 112000, ctr: 6.9, revenue: 19800 },
    { region: 'Telangana', recommendations: 98000, ctr: 8.1, revenue: 21200 },
    { region: 'Rajasthan', recommendations: 87000, ctr: 6.5, revenue: 15600 },
  ],
  north: [
    { region: 'Delhi NCR', recommendations: 198000, ctr: 7.8, revenue: 38200 },
    { region: 'Rajasthan', recommendations: 87000, ctr: 6.5, revenue: 15600 },
    { region: 'Punjab', recommendations: 65000, ctr: 6.8, revenue: 12400 },
    { region: 'Uttar Pradesh', recommendations: 145000, ctr: 6.2, revenue: 18900 },
    { region: 'Haryana', recommendations: 54000, ctr: 7.1, revenue: 10200 },
  ],
  south: [
    { region: 'Karnataka', recommendations: 175000, ctr: 8.5, revenue: 35800 },
    { region: 'Tamil Nadu', recommendations: 156000, ctr: 7.4, revenue: 28900 },
    { region: 'Telangana', recommendations: 98000, ctr: 8.1, revenue: 21200 },
    { region: 'Kerala', recommendations: 72000, ctr: 7.9, revenue: 16500 },
    { region: 'Andhra Pradesh', recommendations: 68000, ctr: 7.0, revenue: 13800 },
  ],
  east: [
    { region: 'West Bengal', recommendations: 112000, ctr: 6.9, revenue: 19800 },
    { region: 'Odisha', recommendations: 45000, ctr: 6.4, revenue: 8200 },
    { region: 'Bihar', recommendations: 78000, ctr: 5.8, revenue: 11500 },
    { region: 'Jharkhand', recommendations: 38000, ctr: 6.1, revenue: 7100 },
    { region: 'Assam', recommendations: 32000, ctr: 6.3, revenue: 5800 },
  ],
  west: [
    { region: 'Maharashtra', recommendations: 245000, ctr: 8.2, revenue: 42500 },
    { region: 'Gujarat', recommendations: 134000, ctr: 7.1, revenue: 24500 },
    { region: 'Goa', recommendations: 18000, ctr: 9.2, revenue: 4800 },
    { region: 'Madhya Pradesh', recommendations: 67000, ctr: 6.5, revenue: 11200 },
  ],
};

type RegionKey = keyof typeof regionData;

export const RegionalPerformance = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('all');

  const data = regionData[selectedRegion];
  const totalRecommendations = data.reduce((acc, d) => acc + d.recommendations, 0);
  const avgCTR = (data.reduce((acc, d) => acc + d.ctr, 0) / data.length).toFixed(1);
  const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0);

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Regional Performance (India)
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="info-tooltip-trigger">
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Recommendation performance across different regions in India
              </TooltipContent>
            </Tooltip>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Recommendations by geographical region
          </p>
        </div>
        <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as RegionKey)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All India</SelectItem>
            <SelectItem value="north">North India</SelectItem>
            <SelectItem value="south">South India</SelectItem>
            <SelectItem value="east">East India</SelectItem>
            <SelectItem value="west">West India</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-secondary rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Total Recommendations</p>
          <p className="text-lg font-bold">{(totalRecommendations / 1000).toFixed(0)}K</p>
        </div>
        <div className="p-3 bg-secondary rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Avg CTR</p>
          <p className="text-lg font-bold">{avgCTR}%</p>
        </div>
        <div className="p-3 bg-secondary rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-lg font-bold">₹{(totalRevenue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="region" width={90} tick={{ fontSize: 12 }} />
            <RechartsTooltip
              formatter={(value: number, name: string) => {
                if (name === 'recommendations') return [`${(value / 1000).toFixed(0)}K`, 'Recommendations'];
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="recommendations" fill="hsl(173, 58%, 39%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performer */}
      <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-success/10 text-success border-success/20">Top Performer</Badge>
            <span className="font-medium">{data[0]?.region}</span>
          </div>
          <span className="text-sm text-muted-foreground">CTR: {data[0]?.ctr}%</span>
        </div>
      </div>
    </div>
  );
};
