"use client";

import { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShieldAlert, MapPin, X, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

function AlertSimContent() {
  const { vitals, setVitals, emergencyContacts } = useAppContext();
  const [countdown, setCountdown] = useState(10);
  const [isAlertSent, setIsAlertSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0 && !isAlertSent) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isAlertSent) {
      setIsAlertSent(true);
    }
  }, [countdown, isAlertSent]);

  const cancelAlert = () => {
    setVitals({ bodyTemperature: 37.0 }); 
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Intense Background Pulses */}
      <div className="absolute inset-0 bg-secondary/5 animate-pulse" />
      
      <AnimatePresence>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full relative z-10"
        >
          <Card className="bg-white border-secondary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pt-12 pb-8 bg-secondary/5">
              <div className="mx-auto h-24 w-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-6 animate-pulse-red">
                <ShieldAlert className="h-12 w-12" />
              </div>
              <CardTitle className="text-4xl font-black text-secondary tracking-tighter uppercase">
                Critical Detection
              </CardTitle>
              <p className="text-muted-foreground mt-2 font-medium">
                Core Temp reached <span className="text-secondary font-bold">{vitals.bodyTemperature.toFixed(1)}°C</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-10 px-10 pb-12 pt-10">
              <div className="text-center">
                {!isAlertSent ? (
                  <div className="space-y-4">
                    <div className="text-8xl font-black text-foreground tabular-nums tracking-tighter">
                      {countdown}
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                      Dispatching Emergency Alerts...
                    </p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-8 rounded-3xl bg-secondary/10 border border-secondary/20 space-y-6"
                  >
                    <div className="flex items-center justify-center gap-3 text-secondary font-bold text-lg uppercase tracking-tight">
                      <BellRing className="h-6 w-6 animate-bounce" />
                      SOS Network Alerted
                    </div>
                    <div className="space-y-3">
                      {emergencyContacts.map(c => (
                        <div key={c.id} className="text-xs text-muted-foreground flex justify-between bg-white/50 p-3 rounded-xl border border-secondary/10">
                          <span className="font-bold">{c.name}</span>
                          <span className="text-secondary font-mono">BROADCAST SENT</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Location Data */}
              <div className="bg-muted p-6 rounded-3xl space-y-6 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <MapPin className="h-4 w-4" />
                    Live GPS Broadcast
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Latitude</p>
                    <p className="text-sm font-mono font-bold">40.7128° N</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Longitude</p>
                    <p className="text-sm font-mono font-bold">74.0060° W</p>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-16 rounded-2xl border-muted-foreground/20 hover:bg-muted font-bold text-muted-foreground uppercase tracking-widest"
                onClick={cancelAlert}
              >
                <X className="mr-2 h-5 w-5" /> Cancel Protocol
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AlertSimPage() {
  return (
    <AppProvider>
      <AlertSimContent />
    </AppProvider>
  );
}