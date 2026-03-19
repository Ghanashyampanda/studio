"use client";

import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { GuidancePanel } from '@/components/dashboard/GuidancePanel';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';
import { HabitsTracker } from '@/components/dashboard/HabitsTracker';
import { TodoSection } from '@/components/dashboard/TodoSection';
import { Shield, Thermometer, Activity, LayoutDashboard, Loader2, MapPin, Clock, ShieldAlert } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

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
    ...(vitalsData?.[0] || {})
  };

  const prefsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'user_settings', 'current');
  }, [db, user]);
  const { data: prefs } = useDoc(prefsRef);
  
  const thresholds = {
    tempMax: prefs?.maxBodyTemperatureThresholdC || 39.5,
    hrMax: prefs?.maxHeartRateThresholdBPM || 140
  };

  // AUTOMATED AI ALERT: Detect critical thresholds and escalate immediately
  useEffect(() => {
    if (latestVitals.bodyTemperatureC >= 40.0) {
      router.push('/alert-sim');
    }
  }, [latestVitals.bodyTemperatureC, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const tempStatus = latestVitals.bodyTemperatureC > thresholds.tempMax ? 'critical' : latestVitals.bodyTemperatureC > thresholds.tempMax - 1 ? 'warning' : 'normal';
  const hrStatus = latestVitals.heartRateBPM > thresholds.hrMax ? 'critical' : latestVitals.heartRateBPM > thresholds.hrMax - 20 ? 'warning' : 'normal';

  return (
    <div className={cn(
      "min-h-screen pt-24 pb-12 transition-colors duration-1000",
      latestVitals.bodyTemperatureC >= 40 ? "bg-red-50 dark:bg-red-950/10" : "bg-background"
    )}>
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Health Command Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
              Surveillance <span className="text-primary">Console</span>
            </h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Live Biometrics for {user.displayName || 'Active User'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border shadow-sm w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 border-r pr-4">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500"
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap text-emerald-600 dark:text-emerald-400">Live Monitoring Active</span>
              </div>
              <div className="flex items-center gap-2 px-3">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Last Sync: {format(new Date(latestVitals.timestamp), 'HH:mm:ss')}
                </span>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {latestVitals.bodyTemperatureC >= 39.5 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-6 rounded-[2rem] flex items-center justify-between mb-4 border-2 shadow-2xl",
                latestVitals.bodyTemperatureC >= 40 
                  ? "bg-destructive text-white border-destructive shadow-destructive/20 animate-pulse" 
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              )}>
                <div className="flex items-center gap-4">
                  <ShieldAlert className={cn("h-8 w-8", latestVitals.bodyTemperatureC >= 40 && "animate-bounce")} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Critical Thermal Warning</p>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      {latestVitals.bodyTemperatureC >= 40 ? "Automated SOS Escalation Active" : "Thermal Threshold Breached"}
                    </h2>
                  </div>
                </div>
                {latestVitals.bodyTemperatureC >= 40 && (
                  <div className="bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Redirecting to Emergency Hub...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalsCard 
            title="Core Temperature" 
            value={latestVitals.bodyTemperatureC} 
            unit="°C" 
            icon={Thermometer} 
            status={tempStatus}
          />
          <VitalsCard 
            title="Heart Rate" 
            value={latestVitals.heartRateBPM} 
            unit="BPM" 
            icon={Activity} 
            status={hrStatus}
          />
          <VitalsCard 
            title="Ambient Temp" 
            value={latestVitals.outsideTemperatureC} 
            unit="°C" 
            icon={Thermometer} 
            status={latestVitals.outsideTemperatureC > 35 ? 'warning' : 'normal'}
          />
          <VitalsCard 
            title="Heat Index" 
            value={latestVitals.heatIndexC} 
            unit="°C" 
            icon={Shield} 
            status={latestVitals.heatIndexC > 38 ? 'critical' : 'normal'}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskAssessment vitals={latestVitals} />
              <GuidancePanel vitals={latestVitals} />
            </div>
            
            {/* Tactical Location Card */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card overflow-hidden h-[300px] relative group">
              <div className="absolute top-6 left-6 z-10 bg-background/90 backdrop-blur-md p-4 rounded-2xl border shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tactical Tracker</p>
                    <p className="text-xs font-black uppercase text-foreground">Live Geofence Active</p>
                  </div>
                </div>
              </div>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                src={`https://maps.google.com/maps?q=${latestVitals.latitude},${latestVitals.longitude}&z=15&output=embed`}
                className="absolute inset-0 grayscale contrast-125 opacity-80"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-primary rounded-full -m-4"
                  />
                  <div className="h-4 w-4 bg-primary rounded-full border-2 border-white shadow-xl relative z-10" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HabitsTracker />
              <TodoSection />
            </div>
          </div>
          
          <div className="space-y-6">
            <SOSPanel />
            <ConfigPanel />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
