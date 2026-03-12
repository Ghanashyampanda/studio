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
      console.error("Guidance error", err);
      setError("Sync Issue: Retrying...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchGuidance(), 5000);
    return () => clearTimeout(timer);
  }, [vitals.bodyTemperatureC]);

  return (
    <Card className="bg-white border-border shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between p-6">
        <div>
          <CardTitle className="text-lg flex items-center gap-3 font-bold tracking-tight uppercase text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            AI Protocol
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Medical guidance center</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted" onClick={() => fetchGuidance(true)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-secondary/60" />
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{error}</p>
          </div>
        ) : guidance ? (
          <div className="prose prose-blue max-w-none">
            <div className="whitespace-pre-line leading-relaxed text-muted-foreground font-medium text-base">
              {guidance}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <Info className="h-12 w-12 text-muted opacity-50" />
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Initialize Protocol Scan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}