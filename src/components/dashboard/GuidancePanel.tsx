"use client";

import { useState, useEffect, useRef } from 'react';
import { getPreventativeFirstAidGuidance, type PreventativeFirstAidGuidanceOutput } from '@/ai/flows/preventative-first-aid-guidance-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Info, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface GuidancePanelProps {
  vitals: {
    bodyTemperatureC: number;
    heartRateBPM: number;
    humidityPercentage: number;
    heatIndexC: number;
  };
}

export function GuidancePanel({ vitals }: GuidancePanelProps) {
  const [guidance, setGuidance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastAnalyzedTemp = useRef<number | null>(null);

  const fetchGuidance = async (force = false) => {
    // Stricter change detection: Only update if temperature changed by more than 0.5°C
    if (!force && lastAnalyzedTemp.current !== null && Math.abs(lastAnalyzedTemp.current - vitals.bodyTemperatureC) < 0.5) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getPreventativeFirstAidGuidance({
        currentBodyTemperature: vitals.bodyTemperatureC,
        currentHeartRate: vitals.heartRateBPM,
        humidity: vitals.humidityPercentage,
        heatIndex: vitals.heatIndexC,
        riskLevel: vitals.bodyTemperatureC > 39 ? 'high' : vitals.bodyTemperatureC > 38 ? 'moderate' : 'low',
        symptoms: vitals.bodyTemperatureC > 38.5 ? ['Dizziness', 'Heavy sweating'] : []
      });
      setGuidance(result.guidance);
      lastAnalyzedTemp.current = vitals.bodyTemperatureC;
    } catch (err: any) {
      // Server flow handles 429 now, but we catch others here
      console.error("Guidance error", err);
      setError("Sync Issue: Retrying...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Increased debounce to 5s
    const timer = setTimeout(() => fetchGuidance(), 5000);
    return () => clearTimeout(timer);
  }, [vitals.bodyTemperatureC]);

  return (
    <Card className="h-full glass border-accent/20 bg-accent/5 rounded-3xl overflow-hidden">
      <CardHeader className="bg-white/[0.02] border-b border-white/5 flex flex-row items-center justify-between p-6">
        <div>
          <CardTitle className="text-lg flex items-center gap-3 font-black tracking-tight uppercase">
            <ShieldCheck className="h-5 w-5 text-accent" />
            AI Protocol
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Active safety guidance</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10" onClick={() => fetchGuidance(true)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-secondary/60" />
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{error}</p>
          </div>
        ) : guidance ? (
          <div className="text-sm prose prose-blue dark:prose-invert max-w-none">
            <div className="whitespace-pre-line leading-relaxed text-muted-foreground font-medium">
              {guidance}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <Info className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Initialize Protocol Scan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
