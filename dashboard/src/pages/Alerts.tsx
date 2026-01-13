import { useState } from 'react';
import { Bell, AlertTriangle, TrendingDown, RefreshCw, Check, X, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  timestamp: string;
  resolved: boolean;
}

const mockAlerts: Alert[] = [
  { id: '1', type: 'critical', title: 'CTR dropped 15%', timestamp: '2h ago', resolved: false },
  { id: '2', type: 'warning', title: '5 products dropped 10+ ranks', timestamp: '4h ago', resolved: false },
  { id: '3', type: 'warning', title: 'Low stock: Wireless Headphones', timestamp: '6h ago', resolved: false },
  { id: '4', type: 'info', title: 'Model retrained successfully', timestamp: '12h ago', resolved: true },
  { id: '5', type: 'info', title: '23 new products added', timestamp: '1d ago', resolved: true },
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<string>('all');

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return { bg: 'bg-destructive/5 border-destructive/20', icon: AlertTriangle, iconColor: 'text-destructive' };
      case 'warning':
        return { bg: 'bg-warning/5 border-warning/20', icon: TrendingDown, iconColor: 'text-warning' };
      case 'info':
        return { bg: 'bg-info/5 border-info/20', icon: RefreshCw, iconColor: 'text-info' };
    }
  };

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return !alert.resolved;
    return alert.type === filter;
  });

  const activeCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.resolved).length;

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold">Alerts</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setAlerts(alerts.map(a => ({ ...a, resolved: true })))}
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bento-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </div>
          <div className="bento-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-xl font-bold">{criticalCount}</p>
            </div>
          </div>
          <div className="bento-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-xl font-bold">{alerts.filter(a => a.resolved).length}</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alert List */}
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const styles = getAlertStyles(alert.type);
            const Icon = styles.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  styles.bg,
                  alert.resolved && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4', styles.iconColor)} />
                  <span className="font-medium text-sm">{alert.title}</span>
                  {alert.resolved && (
                    <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                      Resolved
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                </div>
                {!alert.resolved && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="bento-card text-center py-8">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No alerts found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
