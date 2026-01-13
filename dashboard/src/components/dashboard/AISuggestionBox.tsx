import { useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight, Package, Pin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { pinItem, boostClearance } from '@/api/rules.api';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  type: 'pricing' | 'inventory' | 'bias' | 'growth' | 'warning';
  title: string;
  action?: string;
  actionUrl?: string;
  itemId?: string; // Optional: for pin action
  category?: string; // Optional: for boost clearance action
  ruleType?: 'pin' | 'boost-clearance'; // Optional: specifies which rule to apply
}

interface AISuggestionBoxProps {
  suggestions: Suggestion[];
  className?: string;
}

const iconMap = {
  pricing: TrendingUp,
  inventory: Package,
  bias: AlertTriangle,
  growth: TrendingUp,
  warning: AlertTriangle,
};

const colorMap = {
  pricing: 'bg-info/10 border-info/20',
  inventory: 'bg-warning/10 border-warning/20',
  bias: 'bg-chart-3/10 border-chart-3/20',
  growth: 'bg-success/10 border-success/20',
  warning: 'bg-destructive/10 border-destructive/20',
};

const iconColorMap = {
  pricing: 'text-info',
  inventory: 'text-warning',
  bias: 'text-chart-3',
  growth: 'text-success',
  warning: 'text-destructive',
};

export function AISuggestionBox({ suggestions, className }: AISuggestionBoxProps) {
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  if (!suggestions.length) return null;

  const handlePin = async (itemId: string, index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: true }));
    try {
      await pinItem(itemId);
      toast({
        title: 'Item Pinned',
        description: 'The item has been pinned to the top of recommendations.',
      });
    } catch (error) {
      console.error('Failed to pin item:', error);
      toast({
        title: 'Error',
        description: 'Failed to pin item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleBoostClearance = async (category: string | undefined, index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: true }));
    try {
      await boostClearance(category);
      toast({
        title: 'Clearance Boosted',
        description: category
          ? `Clearance items in ${category} have been boosted.`
          : 'Clearance items have been boosted.',
      });
    } catch (error) {
      console.error('Failed to boost clearance:', error);
      toast({
        title: 'Error',
        description: 'Failed to boost clearance items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleRuleAction = (suggestion: Suggestion, index: number) => {
    if (suggestion.ruleType === 'pin' && suggestion.itemId) {
      handlePin(suggestion.itemId, index);
    } else if (suggestion.ruleType === 'boost-clearance') {
      handleBoostClearance(suggestion.category, index);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Lightbulb className="w-3.5 h-3.5 text-accent" />
        AI Suggestions
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = iconMap[suggestion.type];
          const isLoading = loadingStates[index] || false;
          const hasRuleAction = suggestion.ruleType && (
            (suggestion.ruleType === 'pin' && suggestion.itemId) ||
            suggestion.ruleType === 'boost-clearance'
          );

          return (
            <div
              key={index}
              className={cn(
                'p-3 rounded-lg border flex items-center gap-3',
                colorMap[suggestion.type]
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', iconColorMap[suggestion.type])} />
              <span className="text-sm font-medium flex-1 truncate">{suggestion.title}</span>
              <div className="flex items-center gap-1">
                {hasRuleAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2 h-7 text-xs gap-1"
                    onClick={() => handleRuleAction(suggestion, index)}
                    disabled={isLoading}
                  >
                    {suggestion.ruleType === 'pin' ? (
                      <>
                        <Pin className="w-3 h-3" />
                        Pin
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        Boost
                      </>
                    )}
                  </Button>
                )}
                {suggestion.action && !hasRuleAction && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 h-7 text-xs"
                  >
                    {suggestion.action}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
