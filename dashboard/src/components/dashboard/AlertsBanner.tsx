import { TrendingDown, RefreshCw, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const alerts = [
  {
    id: 1,
    type: 'warning',
    icon: TrendingDown,
    message: '5 products dropped 10+ ranks',
    href: '/alerts',
  },
  {
    id: 2,
    type: 'info',
    icon: RefreshCw,
    message: 'Model retrained 2h ago',
    href: '/audit',
  },
];

export function AlertsBanner() {
  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
            alert.type === 'warning'
              ? 'bg-warning/5 border-warning/20'
              : 'bg-info/5 border-info/20'
          }`}
        >
          <alert.icon
            className={`w-4 h-4 flex-shrink-0 ${
              alert.type === 'warning' ? 'text-warning' : 'text-info'
            }`}
          />
          <span className="font-medium">{alert.message}</span>
          <Link to={alert.href}>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              View
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
