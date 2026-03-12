"use client";

import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { GuidancePanel } from '@/components/dashboard/GuidancePanel';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';
import { Shield, Bell, LayoutDashboard, Users, AlertTriangle, Thermometer, Activity } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
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
    <div className="min-h-screen flex bg-[#050505] text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col glass-dark border-r border-white/5 sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-16">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">HEATGUARD <span className="text-primary">AI</span></span>
        </div>
        
        <nav className="flex-1 space-y-3">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Health Overview" active />
          <SidebarLink href="/contacts" icon={Users} label="SOS Network" />
          <SidebarLink href="/alert-sim" icon={AlertTriangle} label="System Test" danger />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.displayName?.[0] || user.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.displayName || 'User Profile'}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Active Node</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        <header className="glass-dark border-b border-white/5 sticky top-0 z-50 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">CORE <span className="text-muted-foreground font-light">VITALS</span></h2>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Real-time biometrics active</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Link Secure</span>
            </div>
            <Button variant="ghost" size="icon" className="glass h-12 w-12 rounded-2xl hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-secondary rounded-full border-2 border-[#050505]" />
            </Button>
          </div>
        </header>

        <main className="p-8 space-y-10 max-w-[1600px] mx-auto w-full">
          {/* Vitals Summary Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            <VitalsCard 
              title="Body Core Temp" 
              value={latestVitals.bodyTemperatureC} 
              unit="°C" 
              icon={Thermometer} 
              status={tempStatus}
            />
            <VitalsCard 
              title="Cardiac Rhythm" 
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-2 space-y-10">
              <RiskAssessment vitals={latestVitals} />
              <GuidancePanel vitals={latestVitals} />
            </div>
            <div className="space-y-10">
              <SOSPanel />
              <ConfigPanel />
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label, active = false, danger = false }: { href: string, icon: any, label: string, active?: boolean, danger?: boolean }) {
  return (
    <Link href={href}>
      <Button 
        variant="ghost" 
        className={`w-full justify-start gap-4 h-14 rounded-2xl transition-all duration-300 ${active ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'hover:bg-white/5 text-muted-foreground'} ${danger ? 'text-secondary hover:text-secondary hover:bg-secondary/10' : ''}`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-bold tracking-tight">{label}</span>
      </Button>
    </Link>
  );
}