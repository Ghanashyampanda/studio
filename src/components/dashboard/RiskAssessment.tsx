"use client";

import { useEffect, useState, useRef } from 'react';
import { predictSunstrokeRisk, type SunstrokeRiskOutput } from '@/ai/flows/risk-prediction-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ShieldCheck, Zap, Activity, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface RiskAssessmentProps {
  vitals: {
    bodyTemperatureC: number;
    heartRateBPM: number;
    activityLevel: string;
    humidityPercentage: number;
    heatIndexC: number;
  };
}

export function RiskAssessment({ vitals }: RiskAssessmentProps) {
  const [assessment, setAssessment] = useState<SunstrokeRiskOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastVitals = useRef({ temp: 0, hr: 0 });

  useEffect(() => {
    const fetchRisk = async () => {
      const tempDiff = Math.abs(lastVitals.current.temp - vitals.bodyTemperatureC);
      const hrDiff = Math.abs(lastVitals.current.hr - vitals.heartRateBPM);
      
      if (tempDiff < 0.5 && hrDiff < 10 && assessment) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await predictSunstrokeRisk({
          bodyTemperature: vitals.bodyTemperatureC,
          heartRate: vitals.heartRateBPM,
          activityLevel: (['sedentary', 'light', 'moderate', 'high'].includes(vitals.activityLevel) 
            ? vitals.activityLevel 
            : 'moderate') as any,
          humidity: vitals.humidityPercentage,
          heatIndex: vitals.heatIndexC,
        });
        setAssessment(result);
        lastVitals.current = { temp: vitals.bodyTemperatureC, hr: vitals.heartRateBPM };
      } catch (err: any) {
        console.error("Risk engine error", err);
        setError("Engine offline. Retrying...");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRisk, 5000); 
    return () => clearTimeout(timer);
  }, [vitals.bodyTemperatureC, vitals.heartRateBPM, vitals.activityLevel]);

  const riskStyles = {
    low: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    moderate: 'bg-accent/10 text-accent-foreground border-accent/20',
    high: 'bg-secondary/10 text-secondary border-secondary/20',
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const riskIcons = {
    low: ShieldCheck,
    moderate: Activity,
    high: Zap,
    critical: AlertCircle,
  };

  const Icon = assessment ? riskIcons[assessment.riskLevel] : Activity;

  return (
    <Card className="overflow-hidden border-border bg-white shadow-sm rounded-3xl">
      <CardHeader className="bg-muted/30 border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              AI Risk Engine
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Real-time physiological analysis</CardDescription>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 rounded-full" />
          ) : error ? (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              OFFLINE
            </Badge>
          ) : assessment && (
            <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]", riskStyles[assessment.riskLevel])}>
              <Icon className="h-3.5 w-3.5 mr-2" />
              {assessment.riskLevel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertTriangle className="h-10 w-10 text-secondary opacity-50" />
            <p className="text-sm text-muted-foreground font-bold">{error}</p>
          </div>
        ) : assessment ? (
          <div className="space-y-8">
            <p className="text-base leading-relaxed text-muted-foreground">
              {assessment.explanation}
            </p>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
                Recommended Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.preventativeAdvice.map((advice, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-muted/50 border border-border group hover:border-primary/30 transition-all">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="text-sm font-medium text-foreground leading-snug">{advice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}