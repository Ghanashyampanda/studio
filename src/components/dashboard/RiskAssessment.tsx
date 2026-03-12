"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { predictSunstrokeRisk, type SunstrokeRiskOutput } from '@/ai/flows/risk-prediction-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ShieldCheck, Zap, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function RiskAssessment() {
  const { vitals } = useAppContext();
  const [assessment, setAssessment] = useState<SunstrokeRiskOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      setLoading(true);
      try {
        const result = await predictSunstrokeRisk({
          bodyTemperature: vitals.bodyTemperature,
          heartRate: vitals.heartRate,
          activityLevel: vitals.activityLevel,
          humidity: vitals.humidity,
          heatIndex: vitals.heatIndex,
        });
        setAssessment(result);
      } catch (error) {
        console.error("Failed to predict risk", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRisk, 1000); // Debounce AI calls
    return () => clearTimeout(timer);
  }, [vitals.bodyTemperature, vitals.heartRate, vitals.activityLevel]);

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
    <Card className="col-span-1 md:col-span-2 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              AI Risk Assessment
            </CardTitle>
            <CardDescription>Real-time analysis of sunstroke vulnerability</CardDescription>
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
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        ) : assessment ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-card-foreground">
              {assessment.explanation}
            </p>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Preventative Steps
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assessment.preventativeAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-card-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Unable to generate risk assessment. Please check connectivity.</p>
        )}
      </CardContent>
    </Card>
  );
}
