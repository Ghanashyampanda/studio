"use client";

import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { GuidancePanel } from '@/components/dashboard/GuidancePanel';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';
import { VitalsHistoryChart } from '@/components/dashboard/VitalsHistoryChart';
import { HabitsTracker } from '@/components/dashboard/HabitsTracker';
import { TodoSection } from '@/components/dashboard/TodoSection';
import { Shield, Thermometer, Activity, LayoutDashboard, Bell, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const vitalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'vital_sign_data'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [db, user]);
  const { data: vitalsData, isLoading: isVitalsLoading } = useCollection(vitalsQuery);
  
  // MERGE LOGIC: Ensure mandatory fields for AI Analysis exist via Clinical Defaults
  const defaultVitals = {
    bodyTemperatureC: 37.0,
    heartRateBPM: 72,
    humidityPercentage: 45,
    outsideTemperatureC: 32,
    heatIndexC: 32,
    activityLevel: 'light'
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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12">
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
          <div className="flex items-center justify-center gap-4 bg-card p-3 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 px-3 border-r pr-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">AI Link Active</span>
            </div>
            <button className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HabitsTracker />
              <TodoSection />
            </div>
            <VitalsHistoryChart data={vitalsData || []} />
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
