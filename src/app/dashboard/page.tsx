"use client";

import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { GuidancePanel } from '@/components/dashboard/GuidancePanel';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';
import { Shield, Thermometer, Activity } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  // Fetch Latest Vitals
  const vitalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'vitalsReadings'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
  }, [db, user]);
  const { data: vitalsData } = useCollection(vitalsQuery);
  
  const latestVitals = vitalsData?.[0] || {
    bodyTemperatureC: 37.0,
    heartRateBPM: 72,
    humidityPercentage: 45,
    outsideTemperatureC: 32,
    heatIndexC: 32,
    activityLevel: 'light'
  };

  // Fetch Preferences/Thresholds
  const prefsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'settings', 'preferences');
  }, [db, user]);
  const { data: prefs } = useDoc(prefsRef);
  
  const thresholds = {
    tempMax: prefs?.maxBodyTemperatureThresholdC || 39.5,
    hrMax: prefs?.maxHeartRateThresholdBPM || 140
  };

  // Monitor for danger threshold
  useEffect(() => {
    if (latestVitals.bodyTemperatureC >= 40) {
      router.push('/alert-sim');
    }
  }, [latestVitals.bodyTemperatureC, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tempStatus = latestVitals.bodyTemperatureC > thresholds.tempMax ? 'critical' : latestVitals.bodyTemperatureC > thresholds.tempMax - 1 ? 'warning' : 'normal';
  const hrStatus = latestVitals.heartRateBPM > thresholds.hrMax ? 'critical' : latestVitals.heartRateBPM > thresholds.hrMax - 20 ? 'warning' : 'normal';

  return (
    <div className="min-h-screen bg-background text-foreground pt-28">
      <main className="p-8 space-y-10 max-w-7xl mx-auto w-full">
        {/* Vitals Summary Grid */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase">Medical <span className="text-primary">Dashboard</span></h2>
            <p className="text-sm text-muted-foreground font-medium">Real-time physiological surveillance for UID: {user.uid.slice(0, 8)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Secure AI Link Active</span>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <VitalsCard 
            title="Core Temp" 
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
            title="Heat Index" 
            value={latestVitals.heatIndexC} 
            unit="°C" 
            icon={Thermometer} 
            status={latestVitals.heatIndexC > 35 ? 'warning' : 'normal'}
          />
          <VitalsCard 
            title="Safety Index" 
            value={latestVitals.bodyTemperatureC > 38 ? (100 - ((latestVitals.bodyTemperatureC - 37) * 20)) : 98} 
            unit="%" 
            icon={Shield} 
            status={latestVitals.bodyTemperatureC > 39 ? 'critical' : 'normal'}
          />
        </section>

        {/* Detailed Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <RiskAssessment vitals={latestVitals} />
            <GuidancePanel vitals={latestVitals} />
          </div>
          <div className="space-y-8">
            <SOSPanel />
            <ConfigPanel />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}