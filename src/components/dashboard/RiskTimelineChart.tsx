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
import { Activity, Zap, Loader2, AlertCircle } from "lucide-react";
import { format } from 'date-fns';

interface RiskTimelineChartProps {
  data: any[];
}

export function RiskTimelineChart({ data }: RiskTimelineChartProps) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    
    // Reverse data to show chronological order and map risk levels to numbers
    return [...data].reverse().map(reading => {
      const verdict = (reading.aiVerdict || 'safe').toLowerCase();
      let riskVal = 1; // SAFE / NORMAL
      if (verdict === 'warning' || verdict === 'moderate' || verdict === 'high') riskVal = 2;
      if (verdict === 'critical') riskVal = 3;

      return {
        time: format(new Date(reading.timestamp), 'HH:mm:ss'),
        fullTime: format(new Date(reading.timestamp), 'MMM dd, HH:mm:ss'),
        risk: riskVal,
        temp: reading.bodyTemperatureC,
        status: verdict.toUpperCase()
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border-2 border-border p-4 rounded-2xl shadow-2xl space-y-2 min-w-[180px]">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b pb-2 mb-2">
            {data.fullTime}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-muted-foreground">Risk State:</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              data.risk === 3 ? 'bg-red-500 text-white' : 
              data.risk === 2 ? 'bg-orange-500 text-white' : 
              'bg-emerald-500 text-white'
            }`}>
              {data.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-muted-foreground">Body Temp:</span>
            <span className="text-xs font-black text-foreground">{data.temp.toFixed(1)}°C</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border h-full flex flex-col">
      <div className="p-8 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Risk Forensics</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Prediction <span className="text-primary">Timeline</span></h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background px-4 py-2 rounded-full border border-border shadow-sm">
          <Zap className="h-3.5 w-3.5 text-primary fill-primary/20" />
          Real-time Surveillance
        </div>
      </div>
      
      <div className="p-8 flex-1 w-full min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="50%" stopColor="#f97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
                domain={[0, 3.5]}
                ticks={[1, 2, 3]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: 'currentColor' }}
                className="text-muted-foreground"
                tickFormatter={(val) => {
                  if (val === 1) return 'SAFE';
                  if (val === 2) return 'WARN';
                  if (val === 3) return 'CRIT';
                  return '';
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke="#2563EB" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#riskGradient)" 
                animationDuration={2000}
                strokeLinecap="round"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground space-y-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin opacity-20" />
            <p className="uppercase text-[10px] font-black tracking-widest">Compiling risk timeline...</p>
          </div>
        )}
      </div>
      
      <div className="px-8 py-6 border-t border-border bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase text-muted-foreground">Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[8px] font-black uppercase text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[8px] font-black uppercase text-muted-foreground">Critical</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Dynamic Threshold Active</span>
        </div>
      </div>
    </div>
  );
}
