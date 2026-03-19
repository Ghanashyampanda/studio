"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { 
  Activity, 
  Thermometer, 
  Zap, 
  Heart, 
  ShieldAlert, 
  Loader2, 
  Play, 
  Square, 
  History as HistoryIcon,
  TrendingUp,
  Waves,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DataPoint {
  time: string;
  bodyTemp: number;
  outsideTemp: number;
  heartRate: number;
}

export default function MonitorPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const [isActive, setIsActive] = useState(true);
  const [isCritical, setIsCritical] = useState(false);
  
  const [dataBuffer, setDataBuffer] = useState<DataPoint[]>([]);
  const [latestVitals, setLatestVitals] = useState({
    bodyTemp: 37.0,
    outsideTemp: 32.5,
    heartRate: 72,
    humidity: 45
  });

  const samplingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // REAL-TIME CLOUD SYNC: Simulate high-frequency IoT data and sync to Firestore
  useEffect(() => {
    if (!isActive || !user) {
      if (samplingInterval.current) clearInterval(samplingInterval.current);
      return;
    }

    samplingInterval.current = setInterval(() => {
      setLatestVitals(prev => {
        const tempShift = (Math.random() - 0.45) * 0.15;
        const hrShift = Math.floor((Math.random() - 0.45) * 4);
        
        const nextTemp = Math.min(41.5, Math.max(36.2, prev.bodyTemp + tempShift));
        const nextHR = Math.min(180, Math.max(50, prev.heartRate + hrShift));
        
        // CRITICAL DETECTION: Automatic Escalation if > 40°C
        if (nextTemp >= 40.0) {
          setIsCritical(true);
          setTimeout(() => router.push('/alert-sim'), 2500);
        } else {
          setIsCritical(false);
        }

        const newPoint: DataPoint = {
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          bodyTemp: parseFloat(nextTemp.toFixed(1)),
          outsideTemp: prev.outsideTemp + (Math.random() - 0.5) * 0.05,
          heartRate: nextHR
        };

        setDataBuffer(current => [...current, newPoint].slice(-20));

        // CLOUD DISPATCH: Sync instantly to Firestore for Dashboard reactivity
        if (db && user) {
          const vitalsRef = collection(db, 'users', user.uid, 'vital_sign_data');
          const heatIndex = newPoint.outsideTemp + (prev.humidity > 40 ? (prev.humidity - 40) * 0.15 : 0);
          
          addDocumentNonBlocking(vitalsRef, {
            userId: user.uid,
            timestamp: new Date().toISOString(),
            bodyTemperatureC: nextTemp,
            heartRateBPM: nextHR,
            outsideTemperatureC: newPoint.outsideTemp,
            humidityPercentage: prev.humidity,
            heatIndexC: heatIndex,
            activityLevel: 'moderate',
            deviceType: 'Live IoT Hub'
          });
        }

        return {
          ...prev,
          bodyTemp: nextTemp,
          heartRate: nextHR
        };
      });
    }, 2500);

    return () => {
      if (samplingInterval.current) clearInterval(samplingInterval.current);
    };
  }, [isActive, user, db, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen pt-24 pb-20 font-body transition-colors duration-1000",
      isCritical ? "bg-red-50 dark:bg-red-950/10" : "bg-background"
    )}>
      <main className="max-w-7xl mx-auto px-6 space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
                <Zap className="h-5 w-5 fill-primary/20" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-primary/20 rounded-2xl"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Biometric Surveillance</span>
                <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
                  Real-Time <span className="text-primary">Monitor</span>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 shadow-sm"
                >
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Syncing Active
                </motion.div>
              ) : (
                <motion.div 
                  key="stopped"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-100 dark:bg-slate-900 text-slate-500 px-5 py-2.5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800"
                >
                  <Clock className="h-3 w-3" />
                  Cloud Sync Suspended
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              onClick={() => setIsActive(!isActive)}
              variant={isActive ? "outline" : "default"}
              className="h-12 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] shadow-xl"
            >
              {isActive ? (
                <><Square className="h-3.5 w-3.5 mr-2 fill-current" /> Stop Sync</>
              ) : (
                <><Play className="h-3.5 w-3.5 mr-2 fill-current" /> Start Sync</>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isCritical && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 rounded-[2rem] bg-destructive text-white border-none shadow-2xl shadow-destructive/30 flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tight">CRITICAL THERMAL EVENT</h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                      Core temperature exceeds 40°C threshold. Cloud rescue protocol initiated.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  Redirecting in 2s
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <VitalsCard 
            title="Current Core Temp" 
            value={latestVitals.bodyTemp} 
            unit="°C" 
            icon={Thermometer} 
            status={latestVitals.bodyTemp > 39 ? 'critical' : latestVitals.bodyTemp > 38 ? 'warning' : 'normal'}
          />
          <VitalsCard 
            title="Pulse Frequency" 
            value={latestVitals.heartRate} 
            unit="BPM" 
            icon={Heart} 
            status={latestVitals.heartRate > 140 ? 'warning' : 'normal'}
          />
          <VitalsCard 
            title="Ambient Thermal Index" 
            value={latestVitals.outsideTemp} 
            unit="°C" 
            icon={Waves} 
            status="normal"
          />
        </div>

        <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-card overflow-hidden">
          <div className="p-8 border-b flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <HistoryIcon className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live IoT Buffer</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Real-Time <span className="text-primary">Thermal Flux</span></h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Cloud Node</span>
              </div>
            </div>
          </div>
          <div className="p-8 h-[400px] w-full">
            {dataBuffer.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataBuffer}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis 
                    domain={[30, 42]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '1.5rem', 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      fontSize: '12px',
                      fontWeight: '800',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bodyTemp" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                    name="Core Temperature"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                <p className="text-[10px] font-black uppercase tracking-widest">Establishing IoT Link...</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
