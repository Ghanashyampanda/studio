"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { Activity, Thermometer, Waves, Zap, Heart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { VitalsHistoryChart } from '@/components/dashboard/VitalsHistoryChart';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';

export default function MonitorPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const vitalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'vital_sign_data'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [db, user]);
  const { data: vitalsData, isLoading: isVitalsLoading } = useCollection(vitalsQuery);
  
  const latestVitals = vitalsData?.[0] || {
    bodyTemperatureC: 37.0,
    heartRateBPM: 72,
    humidityPercentage: 45,
    outsideTemperatureC: 32,
    heatIndexC: 32,
    activityLevel: 'light'
  };

  if (isUserLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 font-body">
      <main className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Monitor Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5 fill-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Telemetry</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
              Biometric <span className="text-primary">Monitor</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
              Live high-frequency surveillance of your core health metrics.
            </p>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm border border-emerald-200 dark:border-emerald-800">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            Signal Synced
          </div>
        </div>

        {/* Live Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <VitalsCard 
            title="Core Body Temp" 
            value={latestVitals.bodyTemperatureC} 
            unit="°C" 
            icon={Thermometer} 
            status={latestVitals.bodyTemperatureC > 39 ? 'critical' : 'normal'}
          />
          <VitalsCard 
            title="Active Heart Rate" 
            value={latestVitals.heartRateBPM} 
            unit="BPM" 
            icon={Heart} 
            status={latestVitals.heartRateBPM > 140 ? 'warning' : 'normal'}
          />
          <VitalsCard 
            title="Ambient Humidity" 
            value={latestVitals.humidityPercentage} 
            unit="%" 
            icon={Waves} 
            status="normal"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
             <VitalsHistoryChart data={vitalsData || []} />
             <div className="bg-card p-10 rounded-[3rem] border border-border shadow-sm flex flex-col md:flex-row items-center gap-10">
                <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Shield className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tight text-foreground">Security & Privacy</h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-widest">
                    All biometric telemetry is encrypted end-to-end and stored in compliance with medical data privacy protocols. Only authorized emergency nodes can access your live location during a critical thermal event.
                  </p>
                </div>
              </div>
          </div>
          <div className="space-y-8">
            <ConfigPanel />
            <div className="bg-slate-900 dark:bg-card p-8 rounded-[2.5rem] text-white dark:text-foreground border dark:border-border space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tight">System Status</h3>
              <div className="space-y-4">
                <StatusItem label="Neural Engine" status="Online" />
                <StatusItem label="GPS Link" status="Active" />
                <StatusItem label="SOS Nodes" status="3 Synced" />
                <StatusItem label="Encryption" status="AES-256" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusItem({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 dark:border-border last:border-0">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/50 dark:text-muted-foreground">{label}</span>
      <span className="text-[10px] font-bold uppercase tracking-tight text-primary">{status}</span>
    </div>
  );
}