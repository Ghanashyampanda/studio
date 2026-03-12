"use client";

import { useEffect, useState } from 'react';
import { predictSunstrokeRisk, type SunstrokeRiskOutput } from '@/ai/flows/risk-prediction-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ShieldCheck, Zap, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  useEffect(() => {
    const fetchRisk = async () => {
      setLoading(true);
      try {
        const result = await predictSunstrokeRisk({
          bodyTemperature: vitals.bodyTemperatureC,
          heartRate: vitals.heartRateBPM,
          // Cast activity level to match the enum expected by the Genkit flow
          activityLevel: (['sedentary', 'light', 'moderate', 'high'].includes(vitals.activityLevel) 
            ? vitals.activityLevel 
            : 'moderate') as any,
          humidity: vitals.humidityPercentage,
          heatIndex: vitals.heatIndexC,
        });
        setAssessment(result);
      } catch (error) {
        // Silently handle error as guidance panel might still show relevant info
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRisk, 1000); // Debounce AI calls
    return () => clearTimeout(timer);
  }, [vitals.bodyTemperatureC, vitals.heartRateBPM, vitals.activityLevel]);

  const riskColors = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
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
    <Card className="col-span-1 md:col-span-2 overflow-hidden border-white/5 bg-white/[0.02]">
      <CardHeader className="bg-primary/5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
              <Activity className="h-5 w-5 text-primary" />
              AI Risk Engine
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Real-time thermal analysis</CardDescription>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 rounded-full" />
          ) : assessment && (
            <Badge variant="outline" className={riskColors[assessment.riskLevel]}>
              <Icon className="h-3 w-3 mr-1" />
              {assessment.riskLevel.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : assessment ? (
          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-muted-foreground font-medium">
              {assessment.explanation}
            </p>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                System Recommendations
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assessment.preventativeAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-bold p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Syncing with thermal sensors...</p>
        )}
      </CardContent>
    </Card>
  );
}