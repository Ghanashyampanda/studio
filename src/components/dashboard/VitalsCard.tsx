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
    normal: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-secondary animate-pulse-subtle',
  };

  const bgGradients = {
    normal: 'from-emerald-500/5 to-transparent',
    warning: 'from-amber-500/5 to-transparent',
    critical: 'from-secondary/10 to-transparent',
  };

  const borderColors = {
    normal: 'border-white/5',
    warning: 'border-amber-500/20',
    critical: 'border-secondary/30',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "glass overflow-hidden border transition-all duration-300 relative",
        borderColors[status]
      )}>
        <div className={cn("absolute inset-0 bg-gradient-to-br -z-10 opacity-30", bgGradients[status])} />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          <Icon className={cn("h-5 w-5", statusColors[status])} />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-1">
            <div className={cn("text-4xl font-black font-headline tracking-tighter", statusColors[status])}>
              {typeof value === 'number' ? value.toFixed(1) : value}
            </div>
            <div className="text-sm font-bold text-muted-foreground opacity-60">{unit}</div>
          </div>
          {trend && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground">REAL-TIME TREND</span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full glass", statusColors[status])}>
                {trend.toUpperCase()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
