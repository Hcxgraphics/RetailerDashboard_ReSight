import { useEffect, useState } from 'react';
import { Eye, MousePointerClick, DollarSign, Package, ShoppingCart, Wifi, WifiOff } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecommendationTable } from '@/components/dashboard/RecommendationTable';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { CategoryDistribution } from '@/components/dashboard/CategoryDistribution';
import { RegionalPerformance } from '@/components/dashboard/RegionalPerformance';
import { fetchMetrics, Metrics } from '@/api/metrics.api';
import { useWebSocket } from '@/hooks/use-websocket';

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const Index = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time WebSocket updates
  const { isConnected, lastMessage } = useWebSocket<{ type: string; data: Metrics }>((message) => {
    if (message.type === 'kpi_update' && message.data) {
      setMetrics(message.data);
      setLoading(false);
    }
  });

  // Initial fetch and periodic polling as fallback
  useEffect(() => {
    const fetchData = () => {
      fetchMetrics()
        .then((data) => {
          setMetrics(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch metrics:', error);
          setLoading(false);
        });
    };

    // Initial fetch
    fetchData();

    // Poll every 30 seconds as fallback if WebSocket is not connected
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Calculate CTR from clicks and views
  const ctr = metrics && metrics.views > 0 
    ? (metrics.clicks / metrics.views) * 100 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Overview</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-success" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-muted-foreground" />
                <span>Polling</span>
              </>
            )}
          </div>
        </div>

        {/* KPI Cards - 5 blocks: Revenue, Views, Clicks, Active Products, Avg Order */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard
            title="Revenue"
            value={loading ? '...' : formatCurrency(metrics?.revenue || 0)}
            change={metrics?.revenueChange}
            icon={<DollarSign className="w-5 h-5 text-success" />}
            tooltip="Revenue from recommendation clicks"
          />
          <MetricCard
            title="Views"
            value={loading ? '...' : formatNumber(metrics?.views || 0)}
            change={metrics?.viewsChange}
            icon={<Eye className="w-5 h-5 text-info" />}
            tooltip="Times recommended products were viewed"
          />
          <MetricCard
            title="Clicks"
            value={loading ? '...' : formatPercentage(ctr)}
            change={metrics?.clicksChange}
            icon={<MousePointerClick className="w-5 h-5 text-chart-3" />}
            tooltip="Click-through rate on recommendations"
          />
          <MetricCard
            title="Active Products"
            value={loading ? '...' : (metrics?.activeProducts || 0).toLocaleString()}
            change={undefined}
            icon={<Package className="w-5 h-5 text-accent" />}
            tooltip="Products currently in recommendation pool"
          />
          <MetricCard
            title="Avg Order"
            value={loading ? '...' : formatCurrency(metrics?.avgOrderValue || 0)}
            change={undefined}
            icon={<ShoppingCart className="w-5 h-5 text-chart-4" />}
            tooltip="Average order value from recommendations"
          />
        </div>

        {/* Top Recommendations + Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecommendationTable />
          </div>
          <CategoryDistribution />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PerformanceChart />
          <RegionalPerformance />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
