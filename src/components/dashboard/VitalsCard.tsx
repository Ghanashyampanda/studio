
"use client";

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VitalsCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'critical';
}

export function VitalsCard({ title, value, unit, icon: Icon, status }: VitalsCardProps) {
  const statusColors = {
    normal: 'text-emerald-600 bg-emerald-50',
    warning: 'text-secondary bg-secondary/10',
    critical: 'text-destructive bg-destructive/10',
  };

  const borderColors = {
    normal: 'border-slate-200',
    warning: 'border-secondary/20',
    critical: 'border-destructive/20',
  };

  const iconColors = {
    normal: 'text-emerald-500',
    warning: 'text-secondary',
    critical: 'text-destructive',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "p-6 rounded-[2rem] bg-white border shadow-sm flex flex-col justify-between h-full transition-colors",
        borderColors[status]
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
        <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center bg-slate-50", iconColors[status])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className={cn("text-3xl font-black tracking-tighter", status === 'normal' ? 'text-slate-900' : iconColors[status])}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{unit}</span>
        </div>
        
        <div className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
          statusColors[status]
        )}>
          {status}
        </div>
      </div>
    </motion.div>
  );
}
