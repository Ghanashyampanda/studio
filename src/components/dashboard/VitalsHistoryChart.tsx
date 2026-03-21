"use client";

import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { History, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalsHistoryChartProps {
  data: any[];
}

export function VitalsHistoryChart({ data }: VitalsHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    
    // Reverse data to show chronological order
    const result = [...data].reverse().map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      temp: reading.bodyTemperatureC,
      outside: reading.outsideTemperatureC,
    }));
    return result;
  }, [data]);

  return (
    <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border">
      <div className="p-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clinical Data Forensics</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Thermal <span className="text-primary">Stability Audit</span></h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-2 rounded-full border border-border">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Neural Integrity: Nominal
        </div>
      </div>
      <div className="p-8 h-[350px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                domain={['auto', 'auto']}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                className="text-muted-foreground"
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
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#2563EB" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorTemp)" 
                name="Body Temperature"
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="outside" 
                stroke="currentColor" 
                className="text-muted-foreground"
                strokeWidth={2} 
                strokeDasharray="6 6"
                fill="transparent"
                name="Ambient Heat"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Loader2 className="h-10 w-10 animate-spin opacity-20" />
            <p className="uppercase text-[10px] font-black tracking-widest">Awaiting IoT Stream Transmission</p>
          </div>
        )}
      </div>
    </div>
  );
}
