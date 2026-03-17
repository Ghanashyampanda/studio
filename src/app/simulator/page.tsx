"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { predictSunstrokeRisk, type SunstrokeRiskOutput } from '@/ai/flows/risk-prediction-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Thermometer, 
  Waves, 
  Activity, 
  ArrowRight, 
  ShieldAlert, 
  Loader2, 
  RefreshCcw,
  Droplets,
  Wind,
  PlusCircle,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type ActivityLabel = 'Resting' | 'Walking' | 'Heavy work';
const ACTIVITY_MAPPING: Record<ActivityLabel, 'sedentary' | 'moderate' | 'high'> = {
  'Resting': 'sedentary',
  'Walking': 'moderate',
  'Heavy work': 'high'
};

export default function SimulatorPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [bodyTemp, setBodyTemp] = useState(37.0);
  const [outsideTemp, setOutsideTemp] = useState(32.0);
  const [humidity, setHumidity] = useState(45);
  const [heartRate, setHeartRate] = useState(72);
  const [activity, setActivity] = useState<ActivityLabel>('Walking');
  
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<SunstrokeRiskOutput | null>(null);
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const heatIndex = outsideTemp + (humidity > 40 ? (humidity - 40) * 0.1 : 0);
      const result = await predictSunstrokeRisk({
        bodyTemperature: bodyTemp,
        heartRate: heartRate,
        activityLevel: ACTIVITY_MAPPING[activity],
        humidity: humidity,
        heatIndex: heatIndex
      });
      setAssessment(result);
      
      // Calculate a visual risk score for the UI
      const scoreMap = { low: 15, moderate: 45, high: 75, critical: 95 };
      setRiskScore(scoreMap[result.riskLevel]);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial simulation
  useEffect(() => {
    if (user) handleSimulate();
  }, [user]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const riskColor = assessment ? {
    low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100',
    moderate: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-100',
    critical: 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100'
  }[assessment.riskLevel] : 'text-slate-400 bg-slate-50 border-slate-100';

  const riskHighlight = assessment ? {
    low: 'bg-emerald-500',
    moderate: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  }[assessment.riskLevel] : 'bg-slate-300';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pt-24 pb-20 font-body">
      <main className="max-w-6xl mx-auto px-6 space-y-10">
        
        {/* Header */}
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
            <Zap className="h-5 w-5 fill-primary/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Playground</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-foreground">
            AI Sunstroke <span className="text-primary">Simulator</span>
          </h1>
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
            Neural predictive model for hyperthermia risk analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-card overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-muted/30 border-b p-8">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" /> Parameters
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adjust biological and environment nodes</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                
                {/* Body Temp */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Thermometer className="h-4 w-4" /> Body Temp (°C)
                    </label>
                    <span className="text-sm font-black font-mono bg-slate-100 dark:bg-muted px-3 py-1 rounded-lg text-primary">{bodyTemp.toFixed(1)}°</span>
                  </div>
                  <Slider min={36} max={42} step={0.1} value={[bodyTemp]} onValueChange={([v]) => setBodyTemp(v)} />
                </div>

                {/* Outside Temp */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Outside Temp (°C)
                    </label>
                    <span className="text-sm font-black font-mono bg-slate-100 dark:bg-muted px-3 py-1 rounded-lg text-slate-700 dark:text-foreground">{outsideTemp.toFixed(1)}°</span>
                  </div>
                  <Slider min={15} max={50} step={0.5} value={[outsideTemp]} onValueChange={([v]) => setOutsideTemp(v)} />
                </div>

                {/* Humidity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Waves className="h-4 w-4" /> Humidity (%)
                    </label>
                    <span className="text-sm font-black font-mono bg-slate-100 dark:bg-muted px-3 py-1 rounded-lg text-slate-700 dark:text-foreground">{humidity}%</span>
                  </div>
                  <Slider min={0} max={100} step={1} value={[humidity]} onValueChange={([v]) => setHumidity(v)} />
                </div>

                {/* Heart Rate */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Heart Rate (BPM)
                    </label>
                    <span className="text-sm font-black font-mono bg-slate-100 dark:bg-muted px-3 py-1 rounded-lg text-slate-700 dark:text-foreground">{heartRate}</span>
                  </div>
                  <Slider min={40} max={200} step={1} value={[heartRate]} onValueChange={([v]) => setHeartRate(v)} />
                </div>

                {/* Activity Level */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Current Activity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Resting', 'Walking', 'Heavy work'] as ActivityLabel[]).map((act) => (
                      <button
                        key={act}
                        onClick={() => setActivity(act)}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border-2",
                          activity === act 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-slate-50 dark:bg-muted border-transparent text-slate-500 hover:border-slate-200"
                        )}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSimulate} 
                  disabled={isLoading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCcw className="h-5 w-5 mr-2" />}
                  Trigger AI Analysis
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {assessment ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-card overflow-hidden">
                    <div className="p-10 space-y-10">
                      
                      {/* Risk Gauge Header */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
                          <svg className="h-full w-full rotate-[-90deg]">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-muted" />
                            <motion.circle 
                              cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" 
                              strokeDasharray="440"
                              initial={{ strokeDashoffset: 440 }}
                              animate={{ strokeDashoffset: 440 - (440 * riskScore / 100) }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={cn("transition-colors duration-500", 
                                assessment.riskLevel === 'low' ? 'text-emerald-500' :
                                assessment.riskLevel === 'moderate' ? 'text-yellow-500' :
                                assessment.riskLevel === 'high' ? 'text-orange-500' : 'text-red-500'
                              )}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-foreground">{riskScore}%</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Risk Index</span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                          <Badge className={cn("px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border-2", riskColor)}>
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            {assessment.riskLevel} STATE
                          </Badge>
                          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-foreground leading-tight">
                            Sunstroke Risk Detected: <span className={cn(
                              assessment.riskLevel === 'low' ? 'text-emerald-500' :
                              assessment.riskLevel === 'moderate' ? 'text-yellow-500' :
                              assessment.riskLevel === 'high' ? 'text-orange-500' : 'text-red-500'
                            )}>{assessment.riskLevel}</span>
                          </h2>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="bg-slate-50 dark:bg-muted/30 p-8 rounded-[2rem] border border-slate-100 dark:border-border">
                        <p className="text-base text-slate-600 dark:text-muted-foreground font-medium leading-relaxed italic">
                          "{assessment.explanation}"
                        </p>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <PlusCircle className="h-5 w-5 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recommended Protocols</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assessment.preventativeAdvice.map((advice, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-background border-2 border-slate-100 dark:border-border hover:border-primary/20 transition-all group">
                              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", riskHighlight + " text-white shadow-lg")}>
                                {i === 0 ? <Droplets className="h-5 w-5" /> : i === 1 ? <Wind className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-foreground leading-tight uppercase tracking-tight">{advice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Safety Notice */}
                  <div className="p-8 rounded-[2rem] bg-orange-50 dark:bg-orange-950/10 border-2 border-orange-100 dark:border-orange-900/30 flex items-start gap-6">
                    <div className="h-12 w-12 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase tracking-tight text-orange-700 dark:text-orange-400">Simulator Accuracy Disclaimer</h4>
                      <p className="text-[10px] text-orange-600/80 dark:text-orange-500/80 font-bold uppercase tracking-widest leading-relaxed">
                        This simulation utilizes neural network approximations. Real-world risk depends on hydration levels, individual BMI, and direct solar exposure. Always seek professional care if symptoms persist.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center py-20">
                  <div className="text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center mx-auto text-slate-300">
                      <Zap className="h-10 w-10 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Awaiting Simulation Parameters</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
