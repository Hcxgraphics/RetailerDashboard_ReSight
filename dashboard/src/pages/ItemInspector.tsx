import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { explainItem, SHAPExplanation } from '@/api/explain.api';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Info,
  Package,
  BarChart3,
  Tag,
  Layers,
  Sparkles,
  Eye,
  MousePointerClick,
  Zap,
  ShoppingCart,
  Shirt,
  Watch,
  Home,
  Footprints,
  Dumbbell,
  ArrowRight,
  Wrench,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// Helper function to convert SHAP explanation to chart data
const shapToChartData = (shap: SHAPExplanation | null): Array<{ name: string; value: number }> => {
  if (!shap) {
    return [
      { name: 'Popularity', value: 0 },
      { name: 'Price', value: 0 },
      { name: 'Recency', value: 0 },
      { name: 'Stock', value: 0 },
    ];
  }

  // Convert SHAP values to percentages (absolute values, normalized to 100%)
  const entries = Object.entries(shap)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: Math.abs(value || 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 features

  // Normalize to percentage (sum to 100%)
  const sum = entries.reduce((acc, item) => acc + item.value, 0);
  if (sum === 0) {
    return entries;
  }

  return entries.map((item) => ({
    ...item,
    value: (item.value / sum) * 100,
  }));
};

const seasonalityData = [
  { date: 'Dec 10', seasonality: 85, price: 299, stock: 250 },
  { date: 'Dec 11', seasonality: 88, price: 289, stock: 240 },
  { date: 'Dec 12', seasonality: 92, price: 299, stock: 230 },
  { date: 'Dec 13', seasonality: 95, price: 279, stock: 220 },
  { date: 'Dec 14', seasonality: 98, price: 299, stock: 234 },
  { date: 'Dec 15', seasonality: 100, price: 309, stock: 228 },
  { date: 'Dec 16', seasonality: 97, price: 299, stock: 234 },
];

const allProductsData = [
  { date: 'Dec 10', clicks: 1200, views: 15000, rankings: 4.2 },
  { date: 'Dec 11', clicks: 1350, views: 16500, rankings: 4.5 },
  { date: 'Dec 12', clicks: 1500, views: 18000, rankings: 4.8 },
  { date: 'Dec 13', clicks: 1420, views: 17200, rankings: 4.6 },
  { date: 'Dec 14', clicks: 1680, views: 19500, rankings: 5.1 },
  { date: 'Dec 15', clicks: 1820, views: 21000, rankings: 5.4 },
  { date: 'Dec 16', clicks: 1750, views: 20500, rankings: 5.2 },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Electronics': <Watch className="w-8 h-8 text-muted-foreground" />,
  'Apparel': <Shirt className="w-8 h-8 text-muted-foreground" />,
  'Home & Kitchen': <Home className="w-8 h-8 text-muted-foreground" />,
  'Footwear': <Footprints className="w-8 h-8 text-muted-foreground" />,
  'Sports': <Dumbbell className="w-8 h-8 text-muted-foreground" />,
};

// Product database for different IDs
const productDatabase: Record<string, {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  rank: number;
  rankChange: number;
  performance: number;
  performanceChange: number;
  inventory: number;
  inventoryChange: number;
  clicks: number;
  clicksChange: number;
  views: number;
  viewsChange: number;
  image?: string;
}> = {
  '1': { id: '1', name: 'Premium Wireless Headphones', sku: 'WH-1000XM5', category: 'Electronics', brand: 'SoundMax', price: 299.99, rank: 1, rankChange: 2, performance: 98.5, performanceChange: 3.2, inventory: 234, inventoryChange: -12, clicks: 850, clicksChange: 45, views: 12500, viewsChange: 1200 },
  '2': { id: '2', name: 'Organic Cotton T-Shirt', sku: 'OCT-BLK-M', category: 'Apparel', brand: 'EcoWear', price: 49.99, rank: 2, rankChange: -1, performance: 95.2, performanceChange: -1.5, inventory: 456, inventoryChange: 28, clicks: 740, clicksChange: -22, views: 9800, viewsChange: -450 },
  '3': { id: '3', name: 'Smart Fitness Watch', sku: 'SFW-PRO-2', category: 'Electronics', brand: 'FitTech', price: 199.99, rank: 3, rankChange: 0, performance: 93.8, performanceChange: 0.8, inventory: 189, inventoryChange: -5, clicks: 760, clicksChange: 18, views: 10200, viewsChange: 680 },
  '4': { id: '4', name: 'Ceramic Coffee Mug Set', sku: 'CCM-SET-6', category: 'Home & Kitchen', brand: 'HomeCraft', price: 34.99, rank: 4, rankChange: 5, performance: 91.4, performanceChange: 4.8, inventory: 567, inventoryChange: 45, clicks: 730, clicksChange: 65, views: 8900, viewsChange: 920 },
  '5': { id: '5', name: 'Running Shoes Pro', sku: 'RSP-BLU-42', category: 'Footwear', brand: 'SprintMax', price: 129.99, rank: 5, rankChange: -2, performance: 89.6, performanceChange: -2.1, inventory: 312, inventoryChange: -18, clicks: 740, clicksChange: -15, views: 9500, viewsChange: -280 },
  '6': { id: '6', name: 'Bluetooth Speaker Mini', sku: 'BSM-360', category: 'Electronics', brand: 'SoundMax', price: 79.99, rank: 6, rankChange: 1, performance: 87.3, performanceChange: 1.2, inventory: 423, inventoryChange: 8, clicks: 710, clicksChange: 12, views: 8200, viewsChange: 350 },
  '7': { id: '7', name: 'Yoga Mat Premium', sku: 'YMP-ECO-L', category: 'Sports', brand: 'ZenFit', price: 59.99, rank: 7, rankChange: -3, performance: 85.1, performanceChange: -3.5, inventory: 278, inventoryChange: -22, clicks: 680, clicksChange: -28, views: 7800, viewsChange: -420 },
  '8': { id: '8', name: 'LED Desk Lamp', sku: 'LDL-WHT-1', category: 'Home & Kitchen', brand: 'BrightLife', price: 44.99, rank: 8, rankChange: 4, performance: 82.9, performanceChange: 2.8, inventory: 345, inventoryChange: 15, clicks: 670, clicksChange: 32, views: 7200, viewsChange: 480 },
};

const defaultProduct = productDatabase['1'];

const allProductsList = Object.values(productDatabase);

const ItemInspector = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [comparisonToggle, setComparisonToggle] = useState<'price' | 'stock'>('price');
  const [allProductsMetric, setAllProductsMetric] = useState<'clicks' | 'views' | 'rankings'>('clicks');
  const [selectedProductId, setSelectedProductId] = useState<string | 'all'>(id || '1');
  const [shapData, setShapData] = useState<SHAPExplanation | null>(null);
  const [loadingShap, setLoadingShap] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const found = allProductsList.find(
        p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found) {
        setSelectedProductId(found.id);
        navigate(`/inspector/${found.id}`);
      }
    }
  };

  const handleProductSelect = (value: string) => {
    setSelectedProductId(value);
    if (value !== 'all') {
      navigate(`/inspector/${value}`);
    }
  };

  const product = selectedProductId !== 'all' && productDatabase[selectedProductId] 
    ? productDatabase[selectedProductId] 
    : defaultProduct;

  const isAllProducts = selectedProductId === 'all';

  // Fetch SHAP data when a specific product is selected
  useEffect(() => {
    if (!isAllProducts && selectedProductId !== 'all' && productDatabase[selectedProductId]) {
      setLoadingShap(true);
      explainItem(selectedProductId)
        .then((data) => {
          setShapData(data);
          setLoadingShap(false);
        })
        .catch((error) => {
          console.error('Failed to fetch SHAP explanation:', error);
          setShapData(null);
          setLoadingShap(false);
        });
    } else {
      setShapData(null);
    }
  }, [selectedProductId, isAllProducts]);

  const featureData = shapToChartData(shapData);

  const ChangeIndicator = ({ value, size = 'sm', showValue = false }: { value: number; size?: 'sm' | 'lg'; showValue?: boolean }) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-success' : 'text-destructive';
    const sizeClass = size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
    
    return (
      <span className={`flex items-center gap-0.5 ${colorClass}`}>
        <Icon className={sizeClass} />
        {showValue && <span className="text-xs font-medium">{isPositive ? '+' : ''}{value}</span>}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || <Package className="w-8 h-8 text-muted-foreground" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Item Inspector</h1>
          </div>
        </div>

        {/* Product Select Dropdown */}
        <Select value={selectedProductId} onValueChange={handleProductSelect}>
          <SelectTrigger className="w-full max-w-lg">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                All Products
              </div>
            </SelectItem>
            {allProductsList.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{p.rank}</span>
                  {p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isAllProducts ? (
          /* All Products View */
          <>
            {/* Combined Metrics */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bento-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-5 h-5 text-info" />
                </div>
                <p className="text-2xl font-bold">125.4K</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
              <div className="bento-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <MousePointerClick className="w-5 h-5 text-accent" />
                </div>
                <p className="text-2xl font-bold">11.7K</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
              <div className="bento-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                <p className="text-2xl font-bold">91.2</p>
                <p className="text-xs text-muted-foreground">Avg Performance</p>
              </div>
              <div className="bento-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-success" />
                </div>
                <p className="text-2xl font-bold">2,804</p>
                <p className="text-xs text-muted-foreground">Total Stock</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Feature Importance */}
              <div className="bento-card">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold">Feature Importance</h3>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        formatter={(value: number) => [`${value}%`, 'Weight']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analytics Graph with Dropdown */}
              <div className="bento-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-info" />
                    <h3 className="font-semibold">Analytics</h3>
                  </div>
                  <Select value={allProductsMetric} onValueChange={(v) => setAllProductsMetric(v as typeof allProductsMetric)}>
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clicks">Clicks</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="rankings">Rankings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allProductsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={allProductsMetric}
                        stroke="hsl(var(--info))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--info))', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bento-card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">AI Suggestions</h3>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 p-3 bg-secondary rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium">Boost budget items</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => navigate('/manual-controls')}
                    >
                      <Wrench className="w-3 h-3" />
                      Fix
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => navigate('/ask-ai', { state: { query: 'How can I boost budget items to improve visibility and balance recommendation fairness?' } })}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-3 bg-secondary rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-warning" />
                    </div>
                    <span className="text-sm font-medium">New product visibility is low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => navigate('/manual-controls')}
                    >
                      <Wrench className="w-3 h-3" />
                      Fix
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => navigate('/ask-ai', { state: { query: 'How can I improve visibility for new products in recommendations?' } })}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-3 bg-secondary rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-info" />
                    </div>
                    <span className="text-sm font-medium">Popular items are over-indexing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => navigate('/manual-controls')}
                    >
                      <Wrench className="w-3 h-3" />
                      Fix
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => navigate('/ask-ai', { state: { query: 'How can I balance popular items that are over-indexing in recommendations?' } })}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Single Product View */
          <>
            {/* Product Card */}
            <div className="bento-card">
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Product Image/Icon */}
                <div className="w-full lg:w-36 h-36 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    getCategoryIcon(product.category)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold truncate">{product.name}</h2>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        <span className="text-xs text-muted-foreground">{product.sku}</span>
                        <span className="text-xs text-muted-foreground">{product.brand}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold">${product.price}</p>
                    </div>
                  </div>

                  {/* Metrics Grid - Bento Style */}
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    <div className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-muted-foreground">Rank</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="cursor-help">
                              <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Position in recommendations based on AI scoring</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold">#{product.rank}</span>
                        <ChangeIndicator value={product.rankChange} showValue />
                      </div>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-muted-foreground">Performance</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="cursor-help">
                              <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>AI recommendation score (0-100) based on multiple factors</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold">{product.performance}</span>
                        <ChangeIndicator value={product.performanceChange} showValue />
                      </div>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-muted-foreground">Stock</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="cursor-help">
                              <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Current inventory count. Low stock affects visibility.</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold">{product.inventory}</span>
                        <ChangeIndicator value={product.inventoryChange} showValue />
                      </div>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-muted-foreground">Clicks</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="cursor-help">
                              <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Total clicks from recommendation placements</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold">{product.clicks}</span>
                        <ChangeIndicator value={product.clicksChange} showValue />
                      </div>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-muted-foreground">Views</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="cursor-help">
                              <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Total impressions across all recommendation slots</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold">{(product.views / 1000).toFixed(1)}K</span>
                        <ChangeIndicator value={product.viewsChange} showValue />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Why Recommended */}
              <div className="bento-card">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold">Why Recommended</h3>
                  {loadingShap && (
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  )}
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        formatter={(value: number) => [`${value}%`, 'Contribution']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Seasonality vs Price/Stock Comparison */}
              <div className="bento-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-info" />
                    <h3 className="font-semibold">Seasonality vs {comparisonToggle === 'price' ? 'Price' : 'Stock'}</h3>
                  </div>
                  <div className="flex gap-1 bg-secondary rounded-lg p-1">
                    <Button
                      variant={comparisonToggle === 'price' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => setComparisonToggle('price')}
                    >
                      Price
                    </Button>
                    <Button
                      variant={comparisonToggle === 'stock' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => setComparisonToggle('stock')}
                    >
                      Stock
                    </Button>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={seasonalityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="seasonality"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                        name="Seasonality"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey={comparisonToggle}
                        stroke="hsl(var(--info))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--info))', strokeWidth: 2, r: 3 }}
                        name={comparisonToggle === 'price' ? 'Price ($)' : 'Stock'}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bento-card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">AI Suggestions</h3>
              </div>
              <div className="flex flex-col gap-3">
                {/* Actionable AI Suggestions */}
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-secondary rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-sm font-medium">Boost budget items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => navigate('/manual-controls')}
                      >
                        <Wrench className="w-3 h-3" />
                        Fix
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => navigate('/ask-ai', { state: { query: 'How can I boost budget items to improve visibility and balance recommendation fairness?' } })}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-secondary rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-warning" />
                      </div>
                      <span className="text-sm font-medium">New product visibility is low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => navigate('/manual-controls')}
                      >
                        <Wrench className="w-3 h-3" />
                        Fix
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => navigate('/ask-ai', { state: { query: 'How can I improve visibility for new products in recommendations?' } })}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-secondary rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-info" />
                      </div>
                      <span className="text-sm font-medium">Popular items are over-indexing</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => navigate('/manual-controls')}
                      >
                        <Wrench className="w-3 h-3" />
                        Fix
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => navigate('/ask-ai', { state: { query: 'How can I balance popular items that are over-indexing in recommendations?' } })}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Info Cards - under AI Suggestions without Fix button */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-secondary rounded-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-bold">High</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-info" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Season</p>
                      <p className="font-bold">Peak</p>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p className="font-bold">Healthy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ItemInspector;
