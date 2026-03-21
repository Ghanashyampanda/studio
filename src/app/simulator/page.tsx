"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  RotateCcw,
  BrainCircuit,
  Cpu,
  Sparkles
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

  // Telemetry States
  const [bodyTemp, setBodyTemp] = useState(37.0);
  const [outsideTemp, setOutsideTemp] = useState(32.0);
  const [humidity, setHumidity] = useState(45);
  const [heartRate, setHeartRate] = useState(72);
  const [activity, setActivity] = useState<ActivityLabel>('Moderate');
  
  // Simulation Logic States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<SunstrokeRiskOutput | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  /**
   * REAL-TIME RISK CALCULATION
   * Updates instantly as sliders move to provide immediate feedback.
   */
  const liveRiskData = useMemo(() => {
    // 1. Environmental Heat Index Base
    const heatIndex = outsideTemp + (humidity > 40 ? (humidity - 40) * 0.15 : 0);
    
    // 2. Physiological Stress Calculation
    const tempStress = Math.max(0, (bodyTemp - 37) * 22); // High weight for core temp
    const hrStress = Math.max(0, (heartRate - 70) * 0.35); // Cardivascular impact
    
    const activityMultipliers = { 'Resting': 0.8, 'Light': 1.0, 'Moderate': 1.3, 'Heavy': 1.8 };
    const activityFactor = activityMultipliers[activity];

    const envImpact = (heatIndex - 20) * 1.4; 
    const totalScore = Math.min(100, Math.max(5, Math.round((envImpact + tempStress + hrStress) * activityFactor)));

    // 3. Determine Risk State
    let level: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    if (totalScore > 85) level = 'critical';
    else if (totalScore > 65) level = 'high';
    else if (totalScore > 35) level = 'moderate';

    return { score: totalScore, level, heatIndex: heatIndex.toFixed(1) };
  }, [bodyTemp, outsideTemp, humidity, heartRate, activity]);

  const handleSimulate = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await predictSunstrokeRisk({
        bodyTemperature: bodyTemp,
        heartRate: heartRate,
        activityLevel: ACTIVITY_MAPPING[activity],
        humidity: humidity,
        heatIndex: parseFloat(liveRiskData.heatIndex),
        refreshNonce: Math.random().toString(36).substring(7)
      });
      
      if (!result) {
        throw new Error("Neural Engine synchronization timed out.");
      }

      setAssessment(result);
    } catch (err: any) {
      console.error("Simulation Node Error:", err);
      setError(err.message || "Thermal analysis synchronization failed.");
    } finally {
      setIsLoading(false);
    }
  }, [user, bodyTemp, outsideTemp, humidity, heartRate, activity, liveRiskData.heatIndex]);

  const resetToBaseline = () => {
    setBodyTemp(37.0);
    setOutsideTemp(32.0);
    setHumidity(45);
    setHeartRate(72);
    setActivity('Moderate');
    setAssessment(null);
    setError(null);
    setIsLoading(false);
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const riskStyles = {
    low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800',
    moderate: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-800',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-800',
    critical: 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-800'
  }[liveRiskData.level];

  const riskBarColor = {
    low: 'bg-emerald-500',
    moderate: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  }[liveRiskData.level];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pt-24 pb-20 font-body transition-colors duration-500">
      <main className="max-w-7xl mx-auto px-6 space-y-10">
        
        {/* Tactical Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
              <Zap className="h-5 w-5 fill-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Playground</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-foreground">
              Risk <span className="text-primary">Simulator</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest max-w-xl">
              Adjust physiological telemetry nodes to observe real-time risk responses.
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={resetToBaseline}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary h-10 px-4 rounded-xl border border-transparent hover:border-primary/20 transition-all"
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
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adjust physiological inputs</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                
                {/* Body Temp */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground flex items-center gap-2">
                      <Thermometer className="h-4 w-4" /> Body Temperature
                    </label>
                    <span className={cn("text-sm font-black font-mono px-3 py-1 rounded-lg transition-colors", bodyTemp > 39 ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary")}>
                      {bodyTemp.toFixed(1)}°C
                    </span>
                  </div>
                  <Slider min={36} max={42} step={0.1} value={[bodyTemp]} onValueChange={([v]) => setBodyTemp(v)} />
                </div>

                {/* Heart Rate */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" /> Cardiac Rhythm
                    </label>
                    <span className={cn("text-sm font-black font-mono px-3 py-1 rounded-lg transition-colors", heartRate > 140 ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary")}>
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
                  <Slider min={15} max={55} step={0.5} value={[outsideTemp]} onValueChange={([v]) => setOutsideTemp(v)} />
                </div>

                {/* Humidity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground flex items-center gap-2">
                      <Waves className="h-4 w-4" /> Humidity Node
                    </label>
                    <span className="text-sm font-black font-mono bg-slate-100 dark:bg-muted px-3 py-1 rounded-lg text-slate-700 dark:text-foreground">
                      {humidity}%
                    </span>
                  </div>
                  <Slider min={0} max={100} step={1} value={[humidity]} onValueChange={([v]) => setHumidity(v)} />
                </div>

                {/* Activity Level Grid */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground block mb-2">Physiological Demand</label>
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
                  {isLoading ? 'Neural Link Syncing...' : 'Neural Forensic Analysis'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Analysis HUD Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-card overflow-hidden">
              <div className="p-10 space-y-10">
                
                {/* Live HUD Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
                    <svg className="h-full w-full rotate-[-90deg]">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="16" className="text-slate-100 dark:text-muted" />
                      <motion.circle 
                        cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="16" 
                        strokeDasharray="502.6"
                        animate={{ strokeDashoffset: 502.6 - (502.6 * liveRiskData.score / 100) }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={cn("transition-colors duration-500", 
                          liveRiskData.level === 'low' ? 'text-emerald-500' :
                          liveRiskData.level === 'moderate' ? 'text-yellow-500' :
                          liveRiskData.level === 'high' ? 'text-orange-500' : 'text-red-500'
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-foreground">{liveRiskData.score}%</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Risk Factor</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="space-y-2">
                      <Badge className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm", riskStyles)}>
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        {liveRiskData.level} STATE
                      </Badge>
                      <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-foreground leading-tight">
                        System Status: <span className={cn(
                          liveRiskData.level === 'low' ? 'text-emerald-500' :
                          liveRiskData.level === 'moderate' ? 'text-yellow-500' :
                          liveRiskData.level === 'high' ? 'text-orange-500' : 'text-red-500'
                        )}>{liveRiskData.level}</span>
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         <Flame className="h-3.5 w-3.5 text-orange-500" /> Heat Index: {liveRiskData.heatIndex}°C
                       </div>
                       <div className="h-1 w-1 rounded-full bg-slate-300" />
                       <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         <Activity className="h-3.5 w-3.5 text-primary" /> Live Telemetry Linked
                       </div>
                    </div>
                  </div>
                </div>

                {/* AI Rationale & Protocol Guidance */}
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-slate-50 dark:bg-muted/30 p-12 rounded-[2.5rem] border border-dashed border-primary/20 flex flex-col items-center justify-center space-y-4"
                    >
                      <Cpu className="h-8 w-8 text-primary animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Synchronizing Neural Flow...</p>
                    </motion.div>
                  ) : assessment ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-10"
                    >
                      <div className="bg-slate-50 dark:bg-muted/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-border relative">
                        <div className="absolute -top-3 left-8 bg-white dark:bg-card px-4 text-[9px] font-black uppercase tracking-widest text-primary border rounded-full h-6 flex items-center shadow-sm">Neural Engine Output</div>
                        <p className="text-lg text-slate-600 dark:text-muted-foreground font-medium leading-relaxed italic pt-2">
                          "{assessment.explanation}"
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Response Protocols</h3>
                          </div>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">
                            <Sparkles className="h-3 w-3 mr-1" /> Dynamic Tips
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assessment.preventativeAdvice.map((advice, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-background border-2 border-slate-100 dark:border-border hover:border-primary/20 transition-all group shadow-sm"
                            >
                              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg", riskBarColor)}>
                                {i % 3 === 0 ? <Droplets className="h-6 w-6" /> : i % 3 === 1 ? <Wind className="h-6 w-6" /> : <Stethoscope className="h-6 w-6" />}
                              </div>
                              <span className="text-sm font-black text-slate-700 dark:text-foreground leading-tight uppercase tracking-tight">{advice}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="standby"
                      className="bg-slate-50 dark:bg-muted/30 p-12 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <BrainCircuit className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Analysis Standby</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Adjust sliders for live scoring or trigger forensic report.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            {/* Error Node */}
            {error && (
              <Card className="rounded-[2.5rem] border-2 border-destructive/20 bg-destructive/5 overflow-hidden">
                <div className="p-8 flex items-center gap-6">
                  <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-destructive">Neural Sync Issue</h3>
                    <p className="text-[10px] text-destructive/70 font-bold uppercase tracking-widest">{error}</p>
                  </div>
                  <Button size="sm" onClick={handleSimulate} variant="outline" className="ml-auto rounded-xl border-destructive/20 text-destructive text-[9px] font-black uppercase tracking-widest">Retry</Button>
                </div>
              </Card>
            )}

            {/* Accuracy Warning */}
            <div className="p-8 rounded-[3rem] bg-orange-50 dark:bg-orange-950/10 border-2 border-orange-100 dark:border-orange-900/30 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-orange-500/20">
                <Info className="h-8 w-8" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h4 className="text-sm font-black uppercase tracking-tight text-orange-700 dark:text-orange-400">Simulation Disclaimer</h4>
                <p className="text-[10px] text-orange-600/80 dark:text-orange-500/80 font-bold uppercase tracking-widest leading-relaxed">
                  Real-time scoring uses heuristic stress modeling for instant feedback. For deep analysis, trigger the Neural Forensic node. Always prioritize emergency medical intervention in high-risk zones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
