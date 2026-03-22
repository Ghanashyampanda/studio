"use client";

import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { GuidancePanel } from '@/components/dashboard/GuidancePanel';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';
import { VitalsHistoryChart } from '@/components/dashboard/VitalsHistoryChart';
import { AIMonitoringPanel } from '@/components/dashboard/AIMonitoringPanel';
import { AccuracyChart } from '@/components/dashboard/AccuracyChart';
import { ConfusionMatrix } from '@/components/dashboard/ConfusionMatrix';
import { RiskTimelineChart } from '@/components/dashboard/RiskTimelineChart';
import { AIExplainabilityPanel } from '@/components/dashboard/AIExplainabilityPanel';
import { Shield, Thermometer, Activity, LayoutDashboard, Loader2, MapPin, Clock, ShieldAlert, Zap, BrainCircuit, Sparkles, Cpu } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { predictLearnedRisk, type LearnedRiskOutput } from '@/ai/flows/learned-risk-prediction-flow';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<{ temp: number; humidity: number } | null>(null);
  const [learnedPrediction, setLearnedPrediction] = useState<LearnedRiskOutput | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  // ENVIRONMENTAL SYNC: Fetch real-time weather using GPS location
  useEffect(() => {
    const fetchRealTimeWeather = async () => {
      if (typeof window === 'undefined' || !navigator.geolocation) return;
      
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m`);
          const data = await response.json();
          if (data.current_weather) {
            setWeatherData({
              temp: data.current_weather.temperature,
              humidity: data.hourly?.relative_humidity_2m?.[0] || 45
            });
          }
        } catch (error) {
          console.warn("Environmental Monitoring: Weather API Sync Failed", error);
        }
      }, (error) => console.warn("Environmental Monitoring: Location Access Denied", error), { enableHighAccuracy: true });
    };

    fetchRealTimeWeather();
    const weatherInterval = setInterval(fetchRealTimeWeather, 120000);
    return () => clearInterval(weatherInterval);
  }, []);

  // REAL-TIME DATA HUB: Listen for the latest biometric telemetry
  const vitalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'vital_sign_data'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [db, user]);
  const { data: vitalsData } = useCollection(vitalsQuery);

  // ACCURACY HISTORY HUB: Listen for accuracy data points
  const accuracyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'ai_accuracy_history'),
      orderBy('timestamp', 'desc'),
      limit(15)
    );
  }, [db, user]);
  const { data: accuracyHistory } = useCollection(accuracyQuery);

  // AI METRICS HUB: Listen for confusion matrix and metrics
  const metricsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'ai_metrics', 'current');
  }, [db, user]);
  const { data: aiMetrics } = useDoc(metricsRef);
  
  const defaultVitals = {
    bodyTemperatureC: 37.0,
    heartRateBPM: 72,
    humidityPercentage: 45,
    outsideTemperatureC: 32,
    heatIndexC: 32,
    activityLevel: 'light',
    latitude: 20.3517,
    longitude: 85.8189,
    timestamp: new Date().toISOString()
  };

  const latestVitals = {
    ...defaultVitals,
    ...(vitalsData?.[0] || {}),
    outsideTemperatureC: weatherData?.temp ?? (vitalsData?.[0]?.outsideTemperatureC || defaultVitals.outsideTemperatureC),
    humidityPercentage: weatherData?.humidity ?? (vitalsData?.[0]?.humidityPercentage || defaultVitals.humidityPercentage),
  };

  latestVitals.heatIndexC = latestVitals.outsideTemperatureC + (latestVitals.humidityPercentage > 40 ? (latestVitals.humidityPercentage - 40) * 0.15 : 0);

  // SELF-LEARNING AI: Trigger Learned Prediction
  const runLearnedPrediction = useCallback(async () => {
    if (!vitalsData || vitalsData.length < 2) return;
    setIsTraining(true);
    try {
      const history = vitalsData.slice(1).map(v => ({
        bodyTemperatureC: v.bodyTemperatureC,
        outsideTemperatureC: v.outsideTemperatureC,
        heartRateBPM: v.heartRateBPM || 72,
        riskLevel: v.aiVerdict,
        timestamp: v.timestamp
      }));

      const result = await predictLearnedRisk({
        currentVitals: {
          bodyTemperatureC: latestVitals.bodyTemperatureC,
          outsideTemperatureC: latestVitals.outsideTemperatureC,
          heartRateBPM: latestVitals.heartRateBPM,
          humidityPercentage: latestVitals.humidityPercentage,
          heatIndexC: latestVitals.heatIndexC
        },
        history
      });
      setLearnedPrediction(result);
    } catch (e) {
      console.error("Neural Sync Error:", e);
    } finally {
      setIsTraining(false);
    }
  }, [vitalsData, latestVitals.bodyTemperatureC, latestVitals.outsideTemperatureC, latestVitals.heartRateBPM, latestVitals.humidityPercentage, latestVitals.heatIndexC]);

  useEffect(() => {
    const timer = setTimeout(runLearnedPrediction, 3000);
    return () => clearTimeout(timer);
  }, [latestVitals.bodyTemperatureC, runLearnedPrediction]);

  // AUTOMATED SOS TRIGGER
  useEffect(() => {
    if (latestVitals.bodyTemperatureC >= 40.7 || learnedPrediction?.riskLevel === 'critical') {
      router.push('/alert-sim');
    }
  }, [latestVitals.bodyTemperatureC, learnedPrediction?.riskLevel, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isCritical = latestVitals.bodyTemperatureC >= 40.7 || learnedPrediction?.riskLevel === 'critical';
  const tempStatus = isCritical ? 'critical' : latestVitals.bodyTemperatureC > 39 ? 'warning' : 'normal';

  // Default confusion matrix if not in Firestore yet
  const defaultMatrix = {
    safe: { safe: 45, warning: 3, critical: 0 },
    warning: { safe: 4, warning: 32, critical: 1 },
    critical: { safe: 0, warning: 1, critical: 18 }
  };

  return (
    <div className={cn(
      "min-h-screen pt-24 pb-12 transition-colors duration-700 font-body",
      isCritical ? "bg-red-50 dark:bg-red-950/20" : "bg-background"
    )}>
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
              <Zap className="h-5 w-5 fill-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Monitoring Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
              Surveillance <span className="text-primary">Console</span>
            </h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Real-time IoT + AI Biometrics Hub
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Card className="bg-card p-3 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 border-r">
                <BrainCircuit className={cn("h-4 w-4", isTraining ? "text-primary animate-pulse" : "text-emerald-500")} />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Neural Engine</span>
                  <span className="text-[10px] font-black uppercase text-foreground">
                    {isTraining ? "Syncing..." : "Ready"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3">
                <Clock className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Last Refresh</span>
                  <span className="text-[10px] font-black uppercase text-foreground">
                    {format(new Date(), 'HH:mm:ss')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </header>

        <AnimatePresence>
          {isCritical && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 rounded-[2rem] bg-red-600 text-white border-2 border-red-500 shadow-2xl flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <ShieldAlert className="h-10 w-10 animate-bounce" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Neural Risk Overdrive</p>
                    <h2 className="text-2xl font-black uppercase tracking-tight">⚠️ CRITICAL THERMAL EVENT DETECTED</h2>
                  </div>
                </div>
                <div className="bg-white/20 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest animate-pulse border border-white/30">
                  AUTO-SOS REDIRECT ACTIVE
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalsCard title="Body Temperature" value={latestVitals.bodyTemperatureC} unit="°C" icon={Thermometer} status={tempStatus} />
          <VitalsCard title="Heart Rate" value={latestVitals.heartRateBPM} unit="BPM" icon={Activity} status="normal" />
          <VitalsCard title="Environment Temp" value={latestVitals.outsideTemperatureC} unit="°C" icon={Thermometer} status={latestVitals.outsideTemperatureC > 35 ? 'warning' : 'normal'} />
          <VitalsCard title="Pulse Frequency" value={latestVitals.heartRateBPM} unit="BPM" icon={Activity} status="normal" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskAssessment vitals={latestVitals} />
              <AIMonitoringPanel 
                prediction={learnedPrediction?.riskLevel || 'Safe'} 
                totalRecords={vitalsData?.length || 0} 
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AIExplainabilityPanel prediction={learnedPrediction} isLoading={isTraining} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskTimelineChart data={vitalsData || []} />
              <AccuracyChart data={accuracyHistory || []} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ConfusionMatrix matrix={aiMetrics?.confusionMatrix || defaultMatrix} />
            </div>
          </div>
          
          <div className="space-y-6">
            <SOSPanel />
            <GuidancePanel vitals={latestVitals} />
            <ConfigPanel />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
