"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { History, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalsHistoryChartProps {
  data: any[];
}

export function VitalsHistoryChart({ data }: VitalsHistoryChartProps) {
  const chartData = [...data].reverse().map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: reading.bodyTemperatureC,
    outside: reading.outsideTemperatureC,
  }));

  return (
    <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border">
      <div className="p-8 border-b border-border flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data Forensics</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Thermal <span className="text-primary">History</span></h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-2 rounded-full border border-border">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Stability: Nominal
        </div>
      </div>
      <div className="p-8 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
              className="text-muted-foreground"
              dy={10}
            />
            <YAxis 
              domain={[35, 42]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '1rem', 
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                fontSize: '12px',
                fontWeight: '700',
                color: 'hsl(var(--foreground))'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#2563EB" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              name="Core Temp"
            />
            <Area 
              type="monotone" 
              dataKey="outside" 
              stroke="currentColor" 
              className="text-muted-foreground"
              strokeWidth={2} 
              strokeDasharray="5 5"
              fill="transparent"
              name="Ambient Temp"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}