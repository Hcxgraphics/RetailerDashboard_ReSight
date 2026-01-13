import { useState } from 'react';
import {
  Plug,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Webhook,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const platforms = [
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    status: 'connected' as const,
    lastSync: '2 minutes ago',
    description: 'Sync products, orders, and customer data',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    icon: '🛒',
    status: 'not_connected' as const,
    lastSync: null,
    description: 'WordPress e-commerce integration',
  },
  {
    id: 'magento',
    name: 'Magento',
    icon: '🔶',
    status: 'not_connected' as const,
    lastSync: null,
    description: 'Adobe Commerce platform integration',
  },
  {
    id: 'custom',
    name: 'Custom API',
    icon: '⚙️',
    status: 'connected' as const,
    lastSync: '15 minutes ago',
    description: 'Connect via REST API',
  },
];

const apiEndpoints = [
  { path: '/api/v1/recommendations', method: 'GET', description: 'Fetch product recommendations' },
  { path: '/api/v1/recommendations/:id', method: 'GET', description: 'Get recommendation details' },
  { path: '/api/v1/explanations/:product_id', method: 'GET', description: 'Get recommendation explanations' },
  { path: '/api/v1/overrides', method: 'POST', description: 'Create manual override' },
  { path: '/api/v1/overrides/:id', method: 'DELETE', description: 'Remove override' },
  { path: '/api/v1/rules', method: 'GET', description: 'List business rules' },
];

const webhookEvents = [
  { id: 'rank_change', name: 'Rank Change', description: 'Triggered when a product rank changes significantly', enabled: true },
  { id: 'inventory_conflict', name: 'Inventory Conflict', description: 'Triggered when recommended product has low stock', enabled: true },
  { id: 'model_update', name: 'Model Update', description: 'Triggered when recommendation model is retrained', enabled: false },
  { id: 'bias_alert', name: 'Bias Alert', description: 'Triggered when fairness threshold is exceeded', enabled: true },
];

const Integrations = () => {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhooks, setWebhooks] = useState(webhookEvents);
  const apiKey = import.meta.env.VITE_DEMO_API_KEY || 'demo_api_key_12345';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const toggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Plug className="w-7 h-7 text-accent" />
            Integrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect platforms, access API endpoints, and configure webhooks
          </p>
        </div>

        {/* Connected Platforms */}
        <div className="bento-card">
          <h2 className="text-lg font-semibold mb-4">Connected Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="p-4 border border-border rounded-lg hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={platform.status === 'connected' ? 'default' : 'secondary'}
                    className={
                      platform.status === 'connected'
                        ? 'bg-success/10 text-success border-success/20'
                        : ''
                    }
                  >
                    {platform.status === 'connected' ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <X className="w-3 h-3 mr-1" />
                    )}
                    {platform.status === 'connected' ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {platform.lastSync && (
                    <span className="text-xs text-muted-foreground">
                      Last synced: {platform.lastSync}
                    </span>
                  )}
                  <Button
                    variant={platform.status === 'connected' ? 'outline' : 'default'}
                    size="sm"
                    className="ml-auto"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {platform.status === 'connected' ? 'Manage' : 'Connect'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Access */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">API Access</h2>
              <p className="text-sm text-muted-foreground">
                Use these endpoints to integrate with your custom systems
              </p>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Docs
            </Button>
          </div>

          {/* API Key */}
          <div className="p-4 bg-secondary rounded-lg mb-4">
            <label className="text-sm font-medium mb-2 block">API Key</label>
            <div className="flex items-center gap-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKey, 'API Key')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-2">
            <div className="text-sm font-medium mb-3">Available Endpoints</div>
            {apiEndpoints.map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      endpoint.method === 'GET'
                        ? 'bg-info/10 text-info border-info/20'
                        : endpoint.method === 'POST'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden md:block">
                    {endpoint.description}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(endpoint.path, 'Endpoint')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Webhook className="w-5 h-5 text-accent" />
                Webhooks
              </h2>
              <p className="text-sm text-muted-foreground">
                Receive real-time notifications for important events
              </p>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          {/* Webhook URL */}
          <div className="p-4 bg-secondary rounded-lg mb-4">
            <label className="text-sm font-medium mb-2 block">Webhook URL</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://your-domain.com/webhook"
                className="font-mono text-sm"
              />
              <Button>Save</Button>
            </div>
          </div>

          {/* Event Types */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Event Types</div>
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <div className="font-medium">{webhook.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {webhook.description}
                  </div>
                </div>
                <Switch
                  checked={webhook.enabled}
                  onCheckedChange={() => toggleWebhook(webhook.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bento-card">
          <h2 className="text-lg font-semibold mb-4">Data Export</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col">
              <span className="text-2xl mb-2">📊</span>
              <span className="font-medium">Export CSV</span>
              <span className="text-xs text-muted-foreground mt-1">
                Recommendations data
              </span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <span className="text-2xl mb-2">📋</span>
              <span className="font-medium">Export JSON</span>
              <span className="text-xs text-muted-foreground mt-1">
                Full API response format
              </span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <span className="text-2xl mb-2">📈</span>
              <span className="font-medium">Export Report</span>
              <span className="text-xs text-muted-foreground mt-1">
                PDF analytics report
              </span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;
