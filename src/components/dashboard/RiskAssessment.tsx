"use client";

import { useEffect, useState, useRef } from 'react';
import { predictSunstrokeRisk, type SunstrokeRiskOutput } from '@/ai/flows/risk-prediction-flow';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ShieldCheck, Zap, Activity, AlertTriangle, BrainCircuit } from 'lucide-react';
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
      
      if (tempDiff < 0.2 && hrDiff < 5 && assessment) {
        setLoading(false);
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

    const timer = setTimeout(fetchRisk, 2000); 
    return () => clearTimeout(timer);
  }, [vitals.bodyTemperatureC, vitals.heartRateBPM, vitals.activityLevel]);

  const riskStyles = {
    low: 'text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    moderate: 'text-accent-foreground border-accent/20',
    high: 'text-secondary border-secondary/20',
    critical: 'text-destructive border-destructive/20',
  };

  const riskIcons = {
    low: ShieldCheck,
    moderate: Activity,
    high: Zap,
    critical: AlertCircle,
  };

  const Icon = assessment ? riskIcons[assessment.riskLevel] : Activity;

  return (
    <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border">
      <div className="p-8 border-b border-border flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Engine</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Risk <span className="text-primary">Analysis</span></h3>
        </div>
        {!loading && assessment && (
          <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] border", riskStyles[assessment.riskLevel])}>
            <Icon className="h-3.5 w-3.5 mr-2" />
            {assessment.riskLevel}
          </Badge>
        )}
      </div>
      <div className="p-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertTriangle className="h-10 w-10 text-secondary opacity-50" />
            <p className="text-sm text-muted-foreground font-bold">{error}</p>
          </div>
        ) : assessment ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-muted border border-border">
              <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                {assessment.explanation}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                Prevention Protocol
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {assessment.preventativeAdvice.slice(0, 2).map((advice, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border group hover:border-primary/30 transition-all shadow-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-xs font-bold text-foreground leading-tight">{advice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}