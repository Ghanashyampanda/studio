"use client";

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    normal: 'text-emerald-500',
    warning: 'text-secondary',
    critical: 'text-destructive animate-pulse-subtle',
  };

  const bgColors = {
    normal: 'bg-white',
    warning: 'bg-white',
    critical: 'bg-white',
  };

  const borderColors = {
    normal: 'border-border',
    warning: 'border-secondary/30',
    critical: 'border-destructive/30',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "rounded-3xl border shadow-sm transition-all duration-300 relative overflow-hidden",
        bgColors[status],
        borderColors[status]
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {title}
          </CardTitle>
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center bg-muted", statusColors[status])}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-1">
            <div className={cn("text-4xl font-black font-headline tracking-tighter", statusColors[status])}>
              {typeof value === 'number' ? value.toFixed(1) : value}
            </div>
            <div className="text-xs font-bold text-muted-foreground">{unit}</div>
          </div>
          {trend && (
            <div className="mt-4 pt-4 border-t border-muted flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Trend</span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted", statusColors[status])}>
                {trend.toUpperCase()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}