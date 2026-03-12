"use client";

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VitalsCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export function VitalsCard({ title, value, unit, icon: Icon, status, trend }: VitalsCardProps) {
  const statusColors = {
    normal: 'text-primary',
    warning: 'text-orange-500',
    critical: 'text-destructive animate-pulse-subtle',
  };

  const borderColors = {
    normal: 'border-border',
    warning: 'border-orange-200',
    critical: 'border-destructive/30',
  };

  return (
    <Card className={cn("transition-all duration-300", borderColors[status])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", statusColors[status])} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-1">
          <div className={cn("text-3xl font-bold font-headline", statusColors[status])}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </div>
          <div className="text-sm text-muted-foreground">{unit}</div>
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend === 'up' ? 'Trending higher' : trend === 'down' ? 'Trending lower' : 'Stable'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
