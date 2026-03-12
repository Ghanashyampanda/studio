"use client";

import { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShieldAlert, MapPin, Navigation, X, BellRing } from 'lucide-react';
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
    setVitals({ bodyTemperature: 37.0 }); // Reset simulation
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-secondary/5 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Intense Background Pulses */}
      <div className="absolute inset-0 bg-secondary/10 animate-pulse" />
      
      <AnimatePresence>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full relative z-10"
        >
          <Card className="glass-dark border-secondary/30 shadow-[0_0_100px_rgba(255,0,0,0.2)]">
            <CardHeader className="text-center pt-10">
              <div className="mx-auto h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center text-secondary mb-6 animate-pulse-red">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-secondary tracking-tight">
                SUNSTROKE DETECTED
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Body Temperature: <span className="text-white font-bold">{vitals.bodyTemperature.toFixed(1)}°C</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-10">
              {/* Countdown or Status */}
              <div className="text-center">
                {!isAlertSent ? (
                  <div className="space-y-4">
                    <div className="text-7xl font-black text-white tabular-nums">
                      {countdown}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                      Alerting emergency contacts in...
                    </p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20 space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-secondary font-bold">
                      <BellRing className="h-5 w-5 animate-bounce" />
                      SOS ALERTS SENT (3 ATTEMPTS)
                    </div>
                    <div className="space-y-2">
                      {emergencyContacts.map(c => (
                        <div key={c.id} className="text-xs text-muted-foreground flex justify-between">
                          <span>{c.name}</span>
                          <span className="text-secondary font-mono">NOTIFIED VIA SMS</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Location Data */}
              <div className="glass bg-white/5 rounded-2xl p-6 border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  LIVE LOCATION SHARING
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Latitude</p>
                    <p className="text-sm font-mono">40.7128° N</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Longitude</p>
                    <p className="text-sm font-mono">74.0060° W</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="h-full bg-primary" 
                  />
                </div>
              </div>

              {/* Action */}
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-14 rounded-2xl border-white/10 glass hover:bg-white/10 font-bold"
                onClick={cancelAlert}
              >
                <X className="mr-2 h-5 w-5" /> CANCEL FALSE ALERT
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
