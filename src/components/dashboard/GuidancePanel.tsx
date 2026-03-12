"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { getPreventativeFirstAidGuidance, type PreventativeFirstAidGuidanceOutput } from '@/ai/flows/preventative-first-aid-guidance-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function GuidancePanel() {
  const { vitals } = useAppContext();
  const [guidance, setGuidance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGuidance = async () => {
    setLoading(true);
    try {
      const result = await getPreventativeFirstAidGuidance({
        currentBodyTemperature: vitals.bodyTemperature,
        currentHeartRate: vitals.heartRate,
        humidity: vitals.humidity,
        heatIndex: vitals.heatIndex,
        riskLevel: vitals.bodyTemperature > 39 ? 'high' : vitals.bodyTemperature > 38 ? 'moderate' : 'low',
        symptoms: vitals.bodyTemperature > 38.5 ? ['Dizziness', 'Heavy sweating'] : []
      });
      setGuidance(result.guidance);
    } catch (error) {
      console.error("Guidance error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidance();
  }, []);

  return (
    <Card className="h-full border-accent/30 bg-accent/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" />
          Proactive Guidance
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchGuidance} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : guidance ? (
          <div className="text-sm prose prose-blue dark:prose-invert max-w-none">
            <div className="whitespace-pre-line leading-relaxed text-card-foreground">
              {guidance}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
            <p className="text-sm text-muted-foreground">Click refresh for health-specific advice.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
