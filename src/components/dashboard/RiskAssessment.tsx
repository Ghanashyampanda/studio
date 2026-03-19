
"use client";

import { useEffect, useState, useRef } from 'react';
import { predictSunstrokeRisk, type SunstrokeRiskOutput } from '@/ai/flows/risk-prediction-flow';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ShieldCheck, Zap, Activity, AlertTriangle, BrainCircuit, Flame } from 'lucide-react';
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

  // Heat Index Severity Calculation
  const getRiskLabel = (bodyTemp: number) => {
    if (bodyTemp >= 40) return { label: 'CRITICAL', color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle };
    if (bodyTemp >= 38.5) return { label: 'WARNING', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Zap };
    return { label: 'SAFE', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: ShieldCheck };
  };

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
        setError("Neural engine offline. Syncing...");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRisk, 2000); 
    return () => clearTimeout(timer);
  }, [vitals.bodyTemperatureC, vitals.heartRateBPM, vitals.activityLevel]);

  const riskInfo = getRiskLabel(vitals.bodyTemperatureC);
  const StatusIcon = riskInfo.icon;

  return (
    <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border h-full flex flex-col">
      <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Risk Engine</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Health <span className="text-primary">Integrity</span></h3>
        </div>
        <div className={cn("px-4 py-2 rounded-2xl flex items-center gap-2 border font-black text-[10px] tracking-widest uppercase transition-colors", riskInfo.color)}>
          <StatusIcon className="h-4 w-4" />
          {riskInfo.label}
        </div>
      </div>
      
      <div className="p-8 flex-1 space-y-8">
        {/* Heat Index Meter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              Physiological Heat Index
            </div>
            <span className="text-xs font-black text-foreground uppercase">{vitals.heatIndexC.toFixed(1)}°C Base</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '33%' }} />
            <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: '33%' }} />
            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: '34%' }} />
            <div 
              className="absolute h-5 w-1 bg-foreground border-2 border-background -mt-1 shadow-md transition-all duration-1000" 
              style={{ left: `${Math.min(100, Math.max(0, (vitals.bodyTemperatureC - 36) * 20))}%`, position: 'relative' }} 
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
            <AlertTriangle className="h-10 w-10 text-secondary opacity-50" />
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">{error}</p>
          </div>
        ) : assessment ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-muted/50 border border-border">
              <p className="text-sm leading-relaxed text-muted-foreground font-medium italic">
                "{assessment.explanation}"
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">AI Protocol Recommendations</h4>
              <div className="grid grid-cols-1 gap-2">
                {assessment.preventativeAdvice.slice(0, 2).map((advice, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border group hover:border-primary/30 transition-all">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-tight leading-tight">{advice}</span>
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
