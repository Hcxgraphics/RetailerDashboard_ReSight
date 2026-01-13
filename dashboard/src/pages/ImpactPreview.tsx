import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Play, RefreshCw, Info, ArrowRight, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ImpactPreview = () => {
  const [price, setPrice] = useState([299]);
  const [inventory, setInventory] = useState([200]);
  const [seasonalBoost, setSeasonalBoost] = useState(true);
  const [offersApplied, setOffersApplied] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Calculate realistic impacts based on inputs
  const calculateImpact = () => {
    let priceImpact = 0;
    let inventoryImpact = 0;
    let rankChange = 0;
    let scoreChange = 0;

    // Price impact: Higher prices reduce conversions but increase margin
    // Optimal price range: $200-$350
    if (price[0] < 150) {
      priceImpact = 15; // Cheap = more sales
      scoreChange += 8;
      rankChange = -1; // Better rank
    } else if (price[0] > 400) {
      priceImpact = -18; // Expensive = fewer sales
      scoreChange -= 12;
      rankChange = 2; // Worse rank
    } else if (price[0] >= 250 && price[0] <= 350) {
      priceImpact = 5; // Sweet spot
      scoreChange += 3;
    }

    // Inventory impact: Low stock = lower visibility
    if (inventory[0] < 50) {
      inventoryImpact = -25;
      scoreChange -= 15;
      rankChange += 3;
    } else if (inventory[0] < 100) {
      inventoryImpact = -10;
      scoreChange -= 5;
      rankChange += 1;
    } else if (inventory[0] > 300) {
      inventoryImpact = 5; // Good availability
      scoreChange += 2;
    }

    // Seasonal boost
    const seasonalImpact = seasonalBoost ? 12 : 0;
    scoreChange += seasonalBoost ? 8 : 0;

    // Offers impact: Increases visibility and conversions
    const offersImpact = offersApplied ? 18 : 0;
    scoreChange += offersApplied ? 10 : 0;
    rankChange += offersApplied ? -1 : 0;

    const predictedRank = Math.max(1, Math.min(10, 1 + rankChange));
    const predictedScore = Math.max(50, Math.min(100, 98.5 + scoreChange));

    return {
      priceImpact,
      inventoryImpact,
      seasonalImpact,
      offersImpact,
      predictedRank,
      predictedScore: predictedScore.toFixed(1),
    };
  };

  const impact = calculateImpact();

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 1000);
  };

  const handleReset = () => {
    setPrice([299]);
    setInventory([200]);
    setSeasonalBoost(true);
    setOffersApplied(false);
    setHasRun(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold">Impact Preview</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Sandbox Badge */}
        {!hasRun && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              Safe sandbox
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-info" />
              No live impact
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Panel */}
          <div className="bento-card">
            <h3 className="font-semibold mb-5">Simulation</h3>
            
            <div className="space-y-5">
              {/* Product */}
              <div className="space-y-2">
                <Label className="text-xs">Product</Label>
                <Select defaultValue="headphones">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headphones">Premium Wireless Headphones</SelectItem>
                    <SelectItem value="tshirt">Organic Cotton T-Shirt</SelectItem>
                    <SelectItem value="watch">Smart Fitness Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1 text-xs">
                    Price
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Adjust price to see rank impact</TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="text-sm font-bold">${price[0]}</span>
                </div>
                <Slider value={price} onValueChange={setPrice} min={50} max={600} step={10} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$50</span>
                  <span>$600</span>
                </div>
              </div>

              {/* Inventory */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1 text-xs">
                    Inventory
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Low stock reduces visibility</TooltipContent>
                    </Tooltip>
                  </Label>
                  <span className="text-sm font-bold">{inventory[0]}</span>
                </div>
                <Slider value={inventory} onValueChange={setInventory} min={0} max={500} step={10} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>500</span>
                </div>
              </div>

              {/* Seasonal */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <Label className="text-xs">Seasonal Boost</Label>
                <Switch checked={seasonalBoost} onCheckedChange={setSeasonalBoost} />
              </div>

              {/* Offers */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <Label className="text-xs">Offers Applied</Label>
                <Switch checked={offersApplied} onCheckedChange={setOffersApplied} />
              </div>

              {/* Run Button */}
              <Button onClick={handleRunSimulation} disabled={isRunning} className="w-full gap-2">
                <Play className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Run Preview'}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="bento-card">
            <h3 className="font-semibold mb-5">Predicted Impact</h3>
            
            {!hasRun ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Adjust & run to see impact</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Rank Change */}
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold">#1</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Predicted</p>
                      <p className={cn(
                        'text-2xl font-bold',
                        impact.predictedRank === 1 ? 'text-success' : impact.predictedRank > 3 ? 'text-warning' : 'text-foreground'
                      )}>
                        #{impact.predictedRank}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">Score Now</p>
                    <p className="text-xl font-bold">98.5</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">Predicted</p>
                    <p className={cn(
                      'text-xl font-bold',
                      parseFloat(impact.predictedScore) >= 98 ? 'text-success' : parseFloat(impact.predictedScore) < 80 ? 'text-warning' : 'text-foreground'
                    )}>
                      {impact.predictedScore}
                    </p>
                  </div>
                </div>

                {/* Factor Changes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                    <span>Price Effect</span>
                    <span className={impact.priceImpact > 0 ? 'text-success font-medium' : impact.priceImpact < 0 ? 'text-destructive font-medium' : 'text-muted-foreground font-medium'}>
                      {impact.priceImpact > 0 ? `↑ +${impact.priceImpact}%` : impact.priceImpact < 0 ? `↓ ${impact.priceImpact}%` : '→ 0%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                    <span>Inventory</span>
                    <span className={impact.inventoryImpact > 0 ? 'text-success font-medium' : impact.inventoryImpact < 0 ? 'text-destructive font-medium' : 'text-muted-foreground font-medium'}>
                      {impact.inventoryImpact > 0 ? `↑ +${impact.inventoryImpact}%` : impact.inventoryImpact < 0 ? `↓ ${impact.inventoryImpact}%` : '→ 0%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                    <span>Seasonal</span>
                    <span className={seasonalBoost ? 'text-success font-medium' : 'text-muted-foreground'}>
                      {seasonalBoost ? `↑ +${impact.seasonalImpact}%` : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                    <span>Offers</span>
                    <span className={offersApplied ? 'text-success font-medium' : 'text-muted-foreground'}>
                      {offersApplied ? `↑ +${impact.offersImpact}%` : 'Off'}
                    </span>
                  </div>
                </div>

                {/* Explanation with Know More */}
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {price[0] > 400 
                          ? 'High price is reducing conversion rates and visibility.' 
                          : price[0] < 150
                          ? 'Competitive pricing is boosting conversions.'
                          : inventory[0] < 50 
                          ? 'Low stock levels are impacting recommendation priority.'
                          : inventory[0] < 100
                          ? 'Moderate stock levels - consider restocking soon.'
                          : offersApplied && seasonalBoost
                          ? 'Active offers + seasonal boost maximizing visibility!'
                          : offersApplied 
                          ? 'Active offers are boosting product visibility.'
                          : seasonalBoost
                          ? 'Seasonal boost is helping maintain strong rankings.'
                          : 'Current parameters maintain stable ranking.'}
                      </p>
                      <Link to="/ask-ai" className="text-xs text-accent hover:underline mt-1 inline-block">
                        Know more →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImpactPreview;
