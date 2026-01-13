import { useEffect, useState } from 'react';
import { Package, Headphones, Shirt, Watch, Home, Footprints, Speaker, Dumbbell, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { explainItem, SHAPExplanation } from '@/api/explain.api';

interface ProductIdentityProps {
  name: string;
  sku?: string;
  category?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  itemId?: string; // Optional: if provided, will fetch and show SHAP explanation
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Electronics: Headphones,
  Apparel: Shirt,
  'Home & Kitchen': Home,
  Footwear: Footprints,
  Sports: Dumbbell,
  Accessories: Watch,
  Audio: Speaker,
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function ProductIdentity({
  name,
  sku,
  category,
  imageUrl,
  size = 'md',
  className,
  itemId,
}: ProductIdentityProps) {
  const [shapData, setShapData] = useState<SHAPExplanation | null>(null);
  const [loadingShap, setLoadingShap] = useState(false);
  const Icon = category ? categoryIcons[category] || Package : Package;

  useEffect(() => {
    if (itemId) {
      setLoadingShap(true);
      explainItem(itemId)
        .then((data) => {
          setShapData(data);
          setLoadingShap(false);
        })
        .catch((error) => {
          console.error('Failed to fetch SHAP explanation:', error);
          setLoadingShap(false);
        });
    }
  }, [itemId]);

  const formatShapValue = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  };

  const renderShapTooltip = () => {
    if (!itemId || (!shapData && !loadingShap)) return null;

    if (loadingShap) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="ml-1">
              <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs">Loading explanation...</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (!shapData) return null;

    const shapEntries = Object.entries(shapData)
      .filter(([_, value]) => value !== undefined)
      .sort(([_, a], [__, b]) => Math.abs(b || 0) - Math.abs(a || 0))
      .slice(0, 5); // Show top 5 features

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-1">
            <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="font-medium mb-2 text-xs">Why Recommended (SHAP)</p>
          <div className="space-y-1">
            {shapEntries.map(([feature, value]) => (
              <div key={feature} className="flex justify-between items-center text-xs">
                <span className="capitalize">{feature}:</span>
                <span className={cn(
                  'font-medium',
                  (value || 0) >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {formatShapValue(value)}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0',
          sizeClasses[size]
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('fallback-icon');
            }}
          />
        ) : (
          <Icon className={cn('text-muted-foreground', iconSizeClasses[size])} />
        )}
      </div>
      <div className="min-w-0 flex items-center">
        <div>
          <div className="font-medium truncate">{name}</div>
          {sku && <div className="text-sm text-muted-foreground">{sku}</div>}
        </div>
        {renderShapTooltip()}
      </div>
    </div>
  );
}
