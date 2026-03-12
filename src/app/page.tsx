"use client";

import { AppProvider, useAppContext } from './context/AppContext';
import { VitalsCard } from '@/components/dashboard/VitalsCard';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { GuidancePanel } from '@/components/dashboard/GuidancePanel';
import { ConfigPanel } from '@/components/dashboard/ConfigPanel';
import { Thermometer, Heart, Wind, Flame, Shield, Menu, Bell } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function DashboardContent() {
  const { vitals, thresholds } = useAppContext();

  const tempStatus = vitals.bodyTemperature > thresholds.tempMax ? 'critical' : vitals.bodyTemperature > thresholds.tempMax - 1 ? 'warning' : 'normal';
  const hrStatus = vitals.heartRate > thresholds.hrMax ? 'critical' : vitals.heartRate > thresholds.hrMax - 20 ? 'warning' : 'normal';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-headline text-primary">SunGuard</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Smart Sunstroke Detection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex border-accent/30 text-accent font-semibold px-3 py-1 bg-accent/5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent mr-2 animate-pulse" />
              DEVICE CONNECTED
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Vitals Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalsCard 
            title="Body Temperature" 
            value={vitals.bodyTemperature} 
            unit="°C" 
            icon={Thermometer} 
            status={tempStatus}
            trend={vitals.bodyTemperature > 37.5 ? 'up' : 'stable'}
          />
          <VitalsCard 
            title="Heart Rate" 
            value={vitals.heartRate} 
            unit="BPM" 
            icon={Heart} 
            status={hrStatus}
            trend={vitals.heartRate > 90 ? 'up' : 'stable'}
          />
          <VitalsCard 
            title="Heat Index" 
            value={vitals.heatIndex} 
            unit="°C" 
            icon={Flame} 
            status={vitals.heatIndex > 35 ? 'warning' : 'normal'}
          />
          <VitalsCard 
            title="Humidity" 
            value={vitals.humidity} 
            unit="%" 
            icon={Wind} 
            status="normal"
          />
        </section>

        {/* Action & Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RiskAssessment />
            <GuidancePanel />
          </div>
          <div className="space-y-6">
            <SOSPanel />
            <ConfigPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-white/50 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} SunGuard Health Systems. Always consult a medical professional for serious health concerns.</p>
      </footer>
      <Toaster />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
