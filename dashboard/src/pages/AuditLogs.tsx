import { useState } from 'react';
import { History, Search, Filter, Download, User, Settings, Database, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'override' | 'rule' | 'config' | 'model';
}

const mockLogs: AuditLog[] = [
  { id: '1', timestamp: 'Dec 16, 14:32', user: 'admin', action: 'Pinned "Holiday Bundle" to #1', category: 'override' },
  { id: '2', timestamp: 'Dec 16, 13:45', user: 'marketing', action: 'Updated clearance rule priority', category: 'rule' },
  { id: '3', timestamp: 'Dec 16, 12:20', user: 'system', action: 'Model retrained (94.2% accuracy)', category: 'model' },
  { id: '4', timestamp: 'Dec 16, 11:15', user: 'admin', action: 'Removed exclusion for OSI-123', category: 'override' },
  { id: '5', timestamp: 'Dec 16, 10:00', user: 'system', action: 'Seasonal boost → 1.15x', category: 'config' },
  { id: '6', timestamp: 'Dec 15, 18:45', user: 'ops', action: 'Added high-margin promo rule', category: 'rule' },
  { id: '7', timestamp: 'Dec 15, 16:30', user: 'admin', action: 'Excluded discontinued widget', category: 'override' },
  { id: '8', timestamp: 'Dec 15, 14:22', user: 'system', action: 'Low inventory alert (12 items)', category: 'model' },
];

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getCategoryIcon = (category: AuditLog['category']) => {
    const icons = { override: User, rule: Settings, config: Database, model: Zap };
    return icons[category];
  };

  const getCategoryColor = (category: AuditLog['category']) => {
    const colors = {
      override: 'bg-accent/10 text-accent border-accent/20',
      rule: 'bg-info/10 text-info border-info/20',
      config: 'bg-warning/10 text-warning border-warning/20',
      model: 'bg-success/10 text-success border-success/20',
    };
    return colors[category];
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold">Audit Logs</h1>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bento-card">
            <p className="text-xs text-muted-foreground">Total (30d)</p>
            <p className="text-xl font-bold">1,247</p>
          </div>
          <div className="bento-card">
            <p className="text-xs text-muted-foreground">Manual</p>
            <p className="text-xl font-bold">89</p>
          </div>
          <div className="bento-card">
            <p className="text-xs text-muted-foreground">System</p>
            <p className="text-xl font-bold">1,158</p>
          </div>
          <div className="bento-card">
            <p className="text-xs text-muted-foreground">Users</p>
            <p className="text-xl font-bold">8</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36 h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="override">Override</SelectItem>
              <SelectItem value="rule">Rule</SelectItem>
              <SelectItem value="config">Config</SelectItem>
              <SelectItem value="model">Model</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <div className="bento-card p-0">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-sm font-medium">{filteredLogs.length} events</span>
          </div>
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const Icon = getCategoryIcon(log.category);
              return (
                <div key={log.id} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/50">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{log.action}</span>
                      <Badge className={getCategoryColor(log.category)} variant="outline">
                        {log.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {log.timestamp} • {log.user}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
