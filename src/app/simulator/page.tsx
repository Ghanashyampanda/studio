"use client";

import { useState, useEffect, useCallback } from 'react';
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
  ShieldAlert, 
  Loader2, 
  RefreshCcw,
  Droplets,
  Wind,
  PlusCircle,
  Stethoscope,
  Sun,
  Flame,
  Info,
  ChevronRight,
  Heart,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type ActivityLabel = 'Resting' | 'Light' | 'Moderate' | 'Heavy';
const ACTIVITY_MAPPING: Record<ActivityLabel, 'sedentary' | 'light' | 'moderate' | 'high'> = {
  'Resting': 'sedentary',
  'Light': 'light',
  'Moderate': 'moderate',
  'Heavy': 'high'
};

export default function SimulatorPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [bodyTemp, setBodyTemp] = useState(37.0);
  const [outsideTemp, setOutsideTemp] = useState(32.0);
  const [humidity, setHumidity] = useState(45);
  const [heartRate, setHeartRate] = useState(72);
  const [activity, setActivity] = useState<ActivityLabel>('Moderate');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<SunstrokeRiskOutput | null>(null);
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSimulate = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // Tactical Heat Index Approximation
      const heatIndex = outsideTemp + (humidity > 40 ? (humidity - 40) * 0.15 : 0);
      
      const result = await predictSunstrokeRisk({
        bodyTemperature: bodyTemp,
        heartRate: heartRate,
        activityLevel: ACTIVITY_MAPPING[activity],
        humidity: humidity,
        heatIndex: parseFloat(heatIndex.toFixed(1))
      });
      
      if (!result) {
        throw new Error("The AI Engine returned an empty telemetry response. Please try again.");
      }

      setAssessment(result);
      
      // Calibrate visual score
      const scoreMap = { low: 15, moderate: 45, high: 75, critical: 95 };
      setRiskScore(scoreMap[result.riskLevel]);
    } catch (err: any) {
      console.error("Neural Simulation Failed:", err);
      setError(err.message || "An unexpected error occurred during thermal analysis. Verify system connection.");
    } finally {
      setIsLoading(false);
    }
  }, [user, bodyTemp, outsideTemp, humidity, heartRate, activity]);

  // Initial trigger
  useEffect(() => {
    if (user && !isUserLoading) {
      handleSimulate();
    }
  }, [user, isUserLoading]);

  const resetToBaseline = () => {
    setBodyTemp(37.0);
    setOutsideTemp(32.0);
    setHumidity(45);
    setHeartRate(72);
    setActivity('Moderate');
    setAssessment(null);
    setError(null);
    setRiskScore(0);
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const riskStyles = assessment ? {
    low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800',
    moderate: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-800',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-800',
    critical: 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-800'
  }[assessment.riskLevel] : 'text-slate-400 bg-slate-50 border-slate-100';

  const riskBarColor = assessment ? {
    low: 'bg-emerald-500',
    moderate: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  }[assessment.riskLevel] : 'bg-slate-300';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pt-24 pb-20 font-body transition-colors duration-500">
      <main className="max-w-7xl mx-auto px-6 space-y-10">
        
        {/* Tactical Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5 fill-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medical-Grade Simulation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-foreground">
              Sunstroke <span className="text-primary">Simulator</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest max-w-xl">
              Adjust biological and environmental telemetry nodes to observe neural risk assessment.
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={resetToBaseline}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary h-10 px-4 rounded-xl border border-transparent hover:border-primary/20"
          >
            <RotateCcw className="h-3 w-3 mr-2" /> Reset Baseline
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Simulation Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-card overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-muted/30 border-b p-8">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" /> Telemetry Nodes
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adjust physiological state</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                
                {/* Body Temp */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground flex items-center gap-2">
                      <Thermometer className="h-4 w-4" /> Core Body Temp
                    </label>
                    <span className={cn("text-sm font-black font-mono px-3 py-1 rounded-lg", bodyTemp > 39 ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary")}>
                      {bodyTemp.toFixed(1)}°C
                    </span>
                  </div>
                  <Slider min={36} max={42} step={0.1} value={[bodyTemp]} onValueChange={([v]) => setBodyTemp(v)} />
                </div>

                {/* Heart Rate */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" /> Active Heart Rate
                    </label>
                    <span className={cn("text-sm font-black font-mono px-3 py-1 rounded-lg", heartRate > 140 ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary")}>
                      {heartRate} BPM
                    </span>
                  </div>
                  <Slider min={50} max={180} step={1} value={[heartRate]} onValueChange={([v]) => setHeartRate(v)} />
                </div>

                {/* Outside Temp */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Ambient Heat
                    </label>
                    <span className="text-sm font-black font-mono bg-slate-100 dark:bg-muted px-3 py-1 rounded-lg text-slate-700 dark:text-foreground">
                      {outsideTemp.toFixed(1)}°C
                    </span>
                  </div>
                  <Slider min={15} max={50} step={0.5} value={[outsideTemp]} onValueChange={([v]) => setOutsideTemp(v)} />
                </div>

                {/* Humidity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground flex items-center gap-2">
                      <Waves className="h-4 w-4" /> Humidity Index
                    </label>
                    <span className="text-sm font-black font-mono bg-slate-100 dark:bg-muted px-3 py-1 rounded-lg text-slate-700 dark:text-foreground">
                      {humidity}%
                    </span>
                  </div>
                  <Slider min={0} max={100} step={1} value={[humidity]} onValueChange={([v]) => setHumidity(v)} />
                </div>

                {/* Activity Level Grid */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground block mb-2">Physiological Activity</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(ACTIVITY_MAPPING) as ActivityLabel[]).map((act) => (
                      <button
                        key={act}
                        onClick={() => setActivity(act)}
                        className={cn(
                          "py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border-2 flex items-center justify-between",
                          activity === act 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-slate-50 dark:bg-muted/50 border-transparent text-slate-500 dark:text-muted-foreground hover:border-slate-200"
                        )}
                      >
                        {act}
                        {activity === act && <ChevronRight className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSimulate} 
                  disabled={isLoading}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  ) : (
                    <RefreshCcw className="h-5 w-5 mr-3" />
                  )}
                  {isLoading ? 'Processing Telemetry...' : 'Trigger AI Analysis'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Neural Analysis Column */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card className="rounded-[3rem] border-2 border-destructive/20 bg-destructive/5 overflow-hidden">
                    <div className="p-12 text-center space-y-6">
                      <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mx-auto shadow-lg">
                        <AlertTriangle className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-tight text-destructive">Analysis Protocol Failed</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                          {error}
                        </p>
                      </div>
                      <Button 
                        onClick={handleSimulate}
                        variant="outline"
                        className="rounded-xl border-destructive/20 text-destructive font-black uppercase tracking-widest text-[10px]"
                      >
                        Retry Analysis Node
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : assessment ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-card overflow-hidden">
                    <div className="p-10 space-y-10">
                      
                      {/* Dashboard HUD */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
                          <svg className="h-full w-full rotate-[-90deg]">
                            <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="16" className="text-slate-100 dark:text-muted" />
                            <motion.circle 
                              cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="16" 
                              strokeDasharray="502.6"
                              initial={{ strokeDashoffset: 502.6 }}
                              animate={{ strokeDashoffset: 502.6 - (502.6 * riskScore / 100) }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={cn("transition-colors duration-500", 
                                assessment.riskLevel === 'low' ? 'text-emerald-500' :
                                assessment.riskLevel === 'moderate' ? 'text-yellow-500' :
                                assessment.riskLevel === 'high' ? 'text-orange-500' : 'text-red-500'
                              )}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-foreground">{riskScore}%</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Risk Coefficient</span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-6 text-center md:text-left">
                          <div className="space-y-2">
                            <Badge className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2", riskStyles)}>
                              <ShieldAlert className="h-4 w-4 mr-2" />
                              {assessment.riskLevel} STATE DETECTED
                            </Badge>
                            <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-foreground leading-tight">
                              System Status: <span className={cn(
                                assessment.riskLevel === 'low' ? 'text-emerald-500' :
                                assessment.riskLevel === 'moderate' ? 'text-yellow-500' :
                                assessment.riskLevel === 'high' ? 'text-orange-500' : 'text-red-500'
                              )}>{assessment.riskLevel}</span>
                            </h2>
                          </div>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                               <Flame className="h-3.5 w-3.5 text-orange-500" /> Thermal Index Lock
                             </div>
                             <div className="h-1 w-1 rounded-full bg-slate-300" />
                             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                               <Activity className="h-3.5 w-3.5 text-primary" /> Vitals Sync Active
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Rationale */}
                      <div className="bg-slate-50 dark:bg-muted/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-border relative">
                        <div className="absolute -top-3 left-8 bg-white dark:bg-card px-4 text-[9px] font-black uppercase tracking-widest text-primary border rounded-full h-6 flex items-center">Neural Engine Output</div>
                        <p className="text-lg text-slate-600 dark:text-muted-foreground font-medium leading-relaxed italic pt-2">
                          "{assessment.explanation}"
                        </p>
                      </div>

                      {/* Protocol Recommendations */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <PlusCircle className="h-5 w-5 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Response Protocols</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assessment.preventativeAdvice.map((advice, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-background border-2 border-slate-100 dark:border-border hover:border-primary/20 transition-all group"
                            >
                              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg", riskBarColor)}>
                                {i === 0 ? <Droplets className="h-6 w-6" /> : i === 1 ? <Wind className="h-6 w-6" /> : <Stethoscope className="h-6 w-6" />}
                              </div>
                              <span className="text-sm font-black text-slate-700 dark:text-foreground leading-tight uppercase tracking-tight">{advice}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Accuracy Warning */}
                  <div className="p-8 rounded-[3rem] bg-orange-50 dark:bg-orange-950/10 border-2 border-orange-100 dark:border-orange-900/30 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-orange-500/20">
                      <Info className="h-8 w-8" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                      <h4 className="text-sm font-black uppercase tracking-tight text-orange-700 dark:text-orange-400">Simulation Threshold Disclaimer</h4>
                      <p className="text-[10px] text-orange-600/80 dark:text-orange-500/80 font-bold uppercase tracking-widest leading-relaxed">
                        This environment utilizes neural approximations for educational and diagnostic purposes. Physiological risk is variable and influenced by hydration, metabolism, and radiant heat exposure. Always prioritize professional medical verification.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="standby"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center py-32 space-y-8 bg-white dark:bg-card rounded-[3rem] border border-dashed border-slate-200 dark:border-muted-foreground/20"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                    />
                    <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-muted flex items-center justify-center relative z-10 border border-slate-100 dark:border-border text-slate-300">
                      {isLoading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      ) : (
                        <RefreshCcw className="h-10 w-10 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">
                      {isLoading ? 'Processing Telemetry...' : 'Neural Engine Standby'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {isLoading ? 'Analyzing environmental synergies...' : 'Adjust parameters and trigger analysis to begin'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
