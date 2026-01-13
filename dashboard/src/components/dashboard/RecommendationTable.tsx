import { useEffect, useState } from "react";
import { fetchRankedItems } from "@/api/ranking.api";
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ProductIdentity } from './ProductIdentity';

interface RecommendationItem {
  id: string;
  rank: number;
  rankChange: number;
  name: string;
  sku: string;
  category: string;
  score: number;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  imageUrl?: string;
}

// const allMockData: RecommendationItem[] = [
//   { id: '1', rank: 1, rankChange: 2, name: 'Premium Wireless Headphones', sku: 'WH-1000XM5', category: 'Electronics', score: 98.5, impressions: 45230, clicks: 3856, ctr: 8.5, revenue: 125400, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=64&h=64&fit=crop' },
//   { id: '2', rank: 2, rankChange: -1, name: 'Organic Cotton T-Shirt', sku: 'OCT-BLK-M', category: 'Apparel', score: 95.2, impressions: 38900, clicks: 2890, ctr: 7.4, revenue: 89500, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=64&h=64&fit=crop' },
//   { id: '3', rank: 3, rankChange: 0, name: 'Smart Fitness Watch', sku: 'SFW-PRO-2', category: 'Electronics', score: 93.8, impressions: 32100, clicks: 2450, ctr: 7.6, revenue: 78300, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=64&h=64&fit=crop' },
//   { id: '4', rank: 4, rankChange: 5, name: 'Ceramic Coffee Mug Set', sku: 'CCM-SET-6', category: 'Home & Kitchen', score: 91.4, impressions: 28700, clicks: 2100, ctr: 7.3, revenue: 45600, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=64&h=64&fit=crop' },
//   { id: '5', rank: 5, rankChange: -2, name: 'Running Shoes Pro', sku: 'RSP-BLU-42', category: 'Footwear', score: 89.6, impressions: 25400, clicks: 1890, ctr: 7.4, revenue: 67800, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=64&h=64&fit=crop' },
//   { id: '6', rank: 6, rankChange: 1, name: 'Bluetooth Speaker Mini', sku: 'BSM-360', category: 'Electronics', score: 87.3, impressions: 22100, clicks: 1560, ctr: 7.1, revenue: 34500, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=64&h=64&fit=crop' },
//   { id: '7', rank: 7, rankChange: -3, name: 'Yoga Mat Premium', sku: 'YMP-ECO-L', category: 'Sports', score: 85.1, impressions: 19800, clicks: 1340, ctr: 6.8, revenue: 28900, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=64&h=64&fit=crop' },
//   { id: '8', rank: 8, rankChange: 4, name: 'LED Desk Lamp', sku: 'LDL-WHT-1', category: 'Home & Kitchen', score: 82.9, impressions: 17500, clicks: 1180, ctr: 6.7, revenue: 23400, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop' },
// ];

type SortKey = 'rank' | 'score' | 'impressions' | 'clicks' | 'revenue';
type SortDir = 'asc' | 'desc';

interface RecommendationTableProps {
  showAll?: boolean;
  hideViewAll?: boolean;
}

export function RecommendationTable({ showAll = false, hideViewAll = false }: RecommendationTableProps) {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  
  useEffect(() => {
    fetchRankedItems().then((data) => {
      const mapped = data.map((x, idx) => ({
        id: x.item_id,
        rank: idx + 1,
        rankChange: 0,   // will come from backend later
        name: x.name || x.item_id,
        sku: x.item_id,
        category: x.category || "Unknown",
        score: x.score * 100,   // LightGBM outputs 0–1, UI expects 0–100
        impressions: x.views || 0,
        clicks: x.clicks || 0,
        ctr: x.views ? (x.clicks || 0) / x.views : 0,
        revenue: x.revenue || 0,
        imageUrl: x.imageUrl
      }));

      setItems(mapped);
    }).catch((error) => {
      console.error('Failed to fetch ranked items:', error);
      setItems([]);
    });
  }, []);

  const mockData = showAll ? items : items.slice(0, 5);


  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...mockData].sort((a, b) => {
    const multiplier = sortDir === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => handleSort(column)}
    >
      {label}
      {sortKey === column ? (
        sortDir === 'asc' ? (
          <ArrowUp className="ml-1 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-1 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
      )}
    </Button>
  );

  return (
    <div className="bento-card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Top Recommendations</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Products currently being recommended to your customers
            </p>
          </div>
          {!hideViewAll && (
            <Link to="/recommendations">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20">
                <SortButton column="rank" label="Rank" />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <SortButton column="score" label="Performance" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="info-tooltip-trigger">
                        <Info className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p className="font-medium mb-1">Recommendation Performance</p>
                      <p className="text-muted-foreground">
                        A composite metric (0-100) indicating how strongly this product
                        is being recommended based on relevance, popularity, and predicted
                        conversion.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>
                <SortButton column="impressions" label="Views" />
              </TableHead>
              <TableHead>
                <SortButton column="clicks" label="Clicks" />
              </TableHead>
              <TableHead>
                <SortButton column="revenue" label="Revenue" />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.id} className="data-table-row">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">#{item.rank}</span>
                    {item.rankChange !== 0 && (
                      <span
                        className={cn(
                          'flex items-center text-xs',
                          item.rankChange > 0 ? 'text-success' : 'text-destructive'
                        )}
                      >
                        {item.rankChange > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(item.rankChange)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/inspector/${item.id}`}
                    className="hover:text-accent transition-colors"
                  >
                    <ProductIdentity
                      name={item.name}
                      sku={item.sku}
                      category={item.category}
                      imageUrl={item.imageUrl}
                      size="sm"
                      itemId={item.id}
                    />
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{item.score.toFixed(1)}</span>
                </TableCell>
                <TableCell className="font-medium">
                  {item.impressions.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  {item.clicks.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  ₹{item.revenue.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Link to={`/inspector/${item.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
