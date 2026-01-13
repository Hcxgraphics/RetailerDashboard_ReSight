import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Info, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { simulatePriceChange } from '@/api/whatif.api';

interface AnalysisBlockProps {
  headline: string;
  value: string;
  direction: 'up' | 'down' | 'neutral';
  tooltip?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
  itemId?: string; // Optional: if provided, enables What-If price simulation
  currentPrice?: number; // Optional: current price for simulation
}

export function AnalysisBlock({
  headline,
  value,
  direction,
  tooltip,
  action,
  className,
  itemId,
  currentPrice,
}: AnalysisBlockProps) {
  const [newPrice, setNewPrice] = useState<string>('');
  const [rankChange, setRankChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getDirectionIcon = () => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5" />;
      case 'down':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getDirectionColor = () => {
    switch (direction) {
      case 'up':
        return 'text-success bg-success/10 border-success/20';
      case 'down':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      default:
        return 'text-muted-foreground bg-secondary border-border';
    }
  };

  const handleSimulate = async () => {
    if (!itemId || !newPrice) return;
    
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) return;

    setLoading(true);
    try {
      const result = await simulatePriceChange(itemId, price);
      setRankChange(result.rankChange);
    } catch (error) {
      console.error('Failed to simulate price change:', error);
      setRankChange(null);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setNewPrice('');
    setRankChange(null);
  };

  return (
    <div className={cn('p-4 rounded-lg border border-border bg-card', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{headline}</span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="info-tooltip-trigger">
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          {itemId && currentPrice !== undefined && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setDialogOpen(true);
                    resetSimulation();
                  }}
                >
                  <Calculator className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>What-If Price Simulation</DialogTitle>
                  <DialogDescription>
                    Simulate how changing the price would affect this item's ranking.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-price">Current Price</Label>
                    <Input
                      id="current-price"
                      value={`₹${currentPrice.toFixed(2)}`}
                      disabled
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-price">New Price</Label>
                    <Input
                      id="new-price"
                      type="number"
                      placeholder="Enter new price"
                      value={newPrice}
                      onChange={(e) => {
                        setNewPrice(e.target.value);
                        setRankChange(null);
                      }}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {rankChange !== null && (
                    <div className={cn(
                      'p-3 rounded-lg border',
                      rankChange > 0
                        ? 'bg-success/10 border-success/20 text-success'
                        : rankChange < 0
                        ? 'bg-destructive/10 border-destructive/20 text-destructive'
                        : 'bg-secondary border-border'
                    )}>
                      <div className="flex items-center gap-2">
                        {rankChange > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : rankChange < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          Rank change: {rankChange > 0 ? '+' : ''}{rankChange}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetSimulation();
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleSimulate}
                    disabled={loading || !newPrice || parseFloat(newPrice) <= 0}
                  >
                    {loading ? 'Simulating...' : 'Simulate'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center border',
              getDirectionColor()
            )}
          >
            {getDirectionIcon()}
          </div>
        </div>
      </div>
      
      <div className="text-2xl font-bold">{value}</div>

      {action && (
        <Button
          variant="link"
          size="sm"
          className="px-0 mt-2 h-auto text-xs"
          onClick={action.onClick}
        >
          {action.label}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  );
}
