import { ReactNode, useEffect, useState } from "react";
import { fetchMetrics, Metrics } from "@/api/metrics.api";

import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  tooltip?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  tooltip,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-3 h-3" />;
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground';
    if (change > 0) return 'text-success';
    return 'text-destructive';
  };

  return (
    <div className={cn('metric-card', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="info-tooltip-trigger">
                  <Info className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
