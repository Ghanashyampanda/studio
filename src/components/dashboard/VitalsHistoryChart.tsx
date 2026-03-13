
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { History, TrendingUp } from "lucide-react";

interface VitalsHistoryChartProps {
  data: any[];
}

export function VitalsHistoryChart({ data }: VitalsHistoryChartProps) {
  // Process data for the chart
  const chartData = [...data].reverse().map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: reading.bodyTemperatureC,
    outside: reading.outsideTemperatureC,
  }));

  return (
    <div className="bg-white border rounded-[2.5rem] shadow-sm overflow-hidden border-slate-200">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Data Forensics</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">Thermal <span className="text-primary">History</span></h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border">
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              dy={10}
            />
            <YAxis 
              domain={[35, 42]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '1rem', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: '700'
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
              stroke="#94A3B8" 
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
