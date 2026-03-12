"use client";

import { AppProvider, useAppContext } from '../context/AppContext';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { GuidancePanel } from '@/components/dashboard/GuidancePanel';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';
import { Shield, Bell, Menu, LayoutDashboard, Users, AlertTriangle } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { vitals, thresholds } = useAppContext();
  const router = useRouter();
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  // Monitor for danger threshold to trigger alert page
  useEffect(() => {
    if (vitals.bodyTemperature >= 40) {
      router.push('/alert-sim');
    }
  }, [vitals.bodyTemperature, router]);

  if (isMounting) return null;

  const tempStatus = vitals.bodyTemperature > thresholds.tempMax ? 'critical' : vitals.bodyTemperature > thresholds.tempMax - 1 ? 'warning' : 'normal';
  const hrStatus = vitals.heartRate > thresholds.hrMax ? 'critical' : vitals.heartRate > thresholds.hrMax - 20 ? 'warning' : 'normal';

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col glass-dark border-r border-white/5 sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">HeatGuard <span className="text-primary">AI</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard">
            <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/contacts">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5">
              <Users className="h-4 w-4" /> Contacts
            </Button>
          </Link>
          <Link href="/alert-sim">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5 text-secondary">
              <AlertTriangle className="h-4 w-4" /> Simulate Alert
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        <header className="glass-dark border-b border-white/5 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">System <span className="text-muted-foreground font-normal">Health</span></h2>
          <div className="flex items-center gap-4">
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              AI ACTIVE
            </Badge>
            <Button variant="ghost" size="icon" className="glass hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-secondary rounded-full" />
            </Button>
          </div>
        </header>

        <main className="p-6 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Vitals Summary Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <VitalsCard 
              title="Body Core Temp" 
              value={vitals.bodyTemperature} 
              unit="°C" 
              icon={Shield} 
              status={tempStatus}
            />
            <VitalsCard 
              title="Heart Rate" 
              value={vitals.heartRate} 
              unit="BPM" 
              icon={LayoutDashboard} 
              status={hrStatus}
            />
            <VitalsCard 
              title="Heat Index" 
              value={vitals.heatIndex} 
              unit="°C" 
              icon={Shield} 
              status={vitals.heatIndex > 35 ? 'warning' : 'normal'}
            />
            <VitalsCard 
              title="Risk Probability" 
              value={vitals.bodyTemperature > 38 ? 68 : 12} 
              unit="%" 
              icon={Shield} 
              status={vitals.bodyTemperature > 39 ? 'critical' : 'normal'}
            />
          </section>

          {/* Detailed Panels */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <RiskAssessment />
              <GuidancePanel />
            </div>
            <div className="space-y-8">
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

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
