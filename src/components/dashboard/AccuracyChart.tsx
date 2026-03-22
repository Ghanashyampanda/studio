
"use client";

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { Target, TrendingUp, Loader2, Zap } from "lucide-react";
import { format } from 'date-fns';

interface AccuracyChartProps {
  data: any[];
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    
    // Sort by timestamp
    return [...data]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(record => ({
        time: format(new Date(record.timestamp), 'HH:mm'),
        accuracy: record.accuracy,
      }));
  }, [data]);

  return (
    <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border h-full flex flex-col">
      <div className="p-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Engine Performance</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Learning <span className="text-primary">Accuracy Trend</span></h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Stability: Clinical Grade
        </div>
      </div>
      
      <div className="p-8 flex-1 w-full min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border opacity-50" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                className="text-muted-foreground"
                dy={10}
              />
              <YAxis 
                domain={[60, 100]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                className="text-muted-foreground"
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1.25rem', 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  fontSize: '11px',
                  fontWeight: '800',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                }} 
                formatter={(value: number) => [`${value}%`, 'Neural Accuracy']}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#2563EB" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin opacity-20" />
            <p className="uppercase text-[10px] font-black tracking-widest">Generating accuracy baseline...</p>
          </div>
        )}
      </div>
      
      <div className="px-8 py-6 border-t border-border bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary fill-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Self-Optimization Active</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Model version 2.4.0-stable</span>
        </div>
      </div>
    </div>
  );
}
