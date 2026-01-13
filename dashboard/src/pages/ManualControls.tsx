import { useState } from 'react';
import { SlidersHorizontal, Pin, ArrowDown, Trash2, Plus, History, Search, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Override {
  id: string;
  product: string;
  sku: string;
  action: 'pin' | 'demote' | 'exclude';
  position?: number;
  createdAt: string;
  createdBy: string;
}

interface Rule {
  id: string;
  rule_text: string;
  enabled: boolean;
  priority: number;
}

const mockOverrides: Override[] = [
  { id: '1', product: 'Holiday Gift Bundle', sku: 'HGB-2024', action: 'pin', position: 1, createdAt: '2024-12-15', createdBy: 'Admin' },
  { id: '2', product: 'Discontinued Widget', sku: 'DW-OLD-1', action: 'exclude', createdAt: '2024-12-14', createdBy: 'System' },
  { id: '3', product: 'Low Margin Item', sku: 'LMI-123', action: 'demote', createdAt: '2024-12-13', createdBy: 'Marketing' },
];

const mockRules: Rule[] = [
  {
    id: '1',
    rule_text: 'Do not recommend out-of-stock items',
    enabled: true,
    priority: 10,
  },
  {
    id: '2',
    rule_text: 'Boost clearance category by 15%',
    enabled: true,
    priority: 5,
  },
  {
    id: '3',
    rule_text: 'Prioritize items with high margins during promotions',
    enabled: false,
    priority: 3,
  },
];

const ManualControls = () => {
  const [overrides, setOverrides] = useState(mockOverrides);
  const [rules, setRules] = useState(mockRules);
  const [searchQuery, setSearchQuery] = useState('');

  const getActionBadge = (action: Override['action']) => {
    switch (action) {
      case 'pin':
        return <Badge className="bg-success/10 text-success border-success/20">Pinned</Badge>;
      case 'demote':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Demoted</Badge>;
      case 'exclude':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Excluded</Badge>;
    }
  };

  const getActionIcon = (action: Override['action']) => {
    switch (action) {
      case 'pin':
        return <Pin className="w-4 h-4 text-success" />;
      case 'demote':
        return <ArrowDown className="w-4 h-4 text-warning" />;
      case 'exclude':
        return <Trash2 className="w-4 h-4 text-destructive" />;
    }
  };

  const handleRemoveOverride = (id: string) => {
    setOverrides(overrides.filter(o => o.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <SlidersHorizontal className="w-7 h-7 text-accent" />
              Manual Controls
            </h1>
            <p className="text-muted-foreground mt-1">
              Override recommendation rankings with manual rules
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Override
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Manual Override</DialogTitle>
                <DialogDescription>
                  Pin, demote, or exclude a product from recommendations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Search Product</Label>
                  <Input placeholder="Search by name or SKU..." />
                </div>
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pin">
                        <div className="flex items-center gap-2">
                          <Pin className="w-4 h-4 text-success" />
                          Pin to Top
                        </div>
                      </SelectItem>
                      <SelectItem value="demote">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="w-4 h-4 text-warning" />
                          Demote
                        </div>
                      </SelectItem>
                      <SelectItem value="exclude">
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-4 h-4 text-destructive" />
                          Exclude
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Position (for Pin)</Label>
                  <Input type="number" placeholder="1" min={1} max={10} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Override</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Overrides */}
        <div className="bento-card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Active Overrides</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {overrides.length} manual rules currently active
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search overrides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <History className="w-4 h-4" />
                  History
                </Button>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.map((override) => (
                <TableRow key={override.id} className="data-table-row">
                  <TableCell>
                    <div>
                      <p className="font-medium">{override.product}</p>
                      <p className="text-sm text-muted-foreground">{override.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(override.action)}
                      {getActionBadge(override.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {override.position ? `#${override.position}` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {override.createdAt}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{override.createdBy}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveOverride(override.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Business Rules */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-info" />
                Business Rules
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automated rules that affect recommendation behavior
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Rule
            </Button>
          </div>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div 
                key={rule.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  rule.enabled ? "bg-secondary border-border" : "bg-muted/30 border-border/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    rule.enabled ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  )}>
                    {rule.priority}
                  </span>
                  <div>
                    <p className={cn("font-medium", !rule.enabled && "text-muted-foreground")}>{rule.rule_text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Priority: {rule.priority}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleRule(rule.id)}
                  className={cn(
                    "gap-2",
                    rule.enabled ? "text-success hover:text-success" : "text-muted-foreground"
                  )}
                >
                  {rule.enabled ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      Disabled
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Engine Preview */}
        <div className="bento-card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Rule Priority</h3>
            <p className="text-sm text-muted-foreground mt-1">
              How manual overrides interact with AI recommendations
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <span className="w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center font-bold">1</span>
              <div>
                <p className="font-medium">Exclusions</p>
                <p className="text-sm text-muted-foreground">Products are removed from all recommendation slots</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <span className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center font-bold">2</span>
              <div>
                <p className="font-medium">Pinned Positions</p>
                <p className="text-sm text-muted-foreground">Products are locked to specific positions</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <span className="w-8 h-8 rounded-full bg-warning/20 text-warning flex items-center justify-center font-bold">3</span>
              <div>
                <p className="font-medium">Demotions</p>
                <p className="text-sm text-muted-foreground">Products are pushed down in ranking</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <span className="w-8 h-8 rounded-full bg-info/20 text-info flex items-center justify-center font-bold">4</span>
              <div>
                <p className="font-medium">Business Rules</p>
                <p className="text-sm text-muted-foreground">Custom rules applied based on priority</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">5</span>
              <div>
                <p className="font-medium">AI Recommendations</p>
                <p className="text-sm text-muted-foreground">Remaining slots filled by model predictions</p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Actions Section */}
        <div className="bento-card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Quickly apply manual overrides to products
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl cursor-pointer hover:border-success/50 transition-all border border-border bg-background hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Pin className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold">Pin to Top</h4>
                  <p className="text-sm text-muted-foreground">Lock a product to a specific position in recommendations</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl cursor-pointer hover:border-warning/50 transition-all border border-border bg-background hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold">Demote</h4>
                  <p className="text-sm text-muted-foreground">Push a product lower in the recommendation rankings</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl cursor-pointer hover:border-destructive/50 transition-all border border-border bg-background hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h4 className="font-semibold">Exclude</h4>
                  <p className="text-sm text-muted-foreground">Completely remove a product from all recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManualControls;
