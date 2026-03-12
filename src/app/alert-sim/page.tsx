
"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, MapPin, X, BellRing, Navigation, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function AlertSimPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isAlertSent, setIsAlertSent] = useState(false);
  const hasLogged = useRef(false);

  // Fetch Emergency Contacts
  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

  // Countdown Logic & Automatic SOS Dispatch
  useEffect(() => {
    if (countdown > 0 && !isAlertSent) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isAlertSent && !hasLogged.current) {
      setIsAlertSent(true);
      hasLogged.current = true;
      dispatchSOS();
    }
  }, [countdown, isAlertSent]);

  const dispatchSOS = () => {
    if (!db || !user) return;

    const alertRef = collection(db, 'users', user.uid, 'alert_history');
    addDocumentNonBlocking(alertRef, {
      userId: user.uid,
      triggerTimestamp: new Date().toISOString(),
      alertType: 'Critical Hyperthermia',
      messageContent: `EMERGENCY: User core temperature exceeded 40°C. Live location shared.`,
      bodyTemperatureAtAlertC: 40.2,
      status: 'sent',
      locationAtAlertLatitude: 40.7128,
      locationAtAlertLongitude: -74.0060,
      emergencyContactIds: contacts?.map(c => c.id) || []
    });
  };

  const cancelAlert = () => {
    router.push('/dashboard');
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body">
      {/* Intense Background Pulses */}
      <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
      
      <AnimatePresence>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full relative z-10"
        >
          <Card className="bg-white border-destructive/20 shadow-2xl rounded-[3rem] overflow-hidden border-2">
            <CardHeader className="text-center pt-12 pb-8 bg-destructive/5">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="mx-auto h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6 shadow-lg shadow-destructive/20"
              >
                <ShieldAlert className="h-10 w-10" />
              </motion.div>
              <CardTitle className="text-3xl font-black text-destructive tracking-tighter uppercase mb-2">
                Critical Detection
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-destructive/80 font-bold uppercase tracking-widest text-[10px]">
                <AlertTriangle className="h-3 w-3" />
                Hyperthermia Risk Confirmed
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8 pb-12 pt-8">
              <div className="text-center">
                {!isAlertSent ? (
                  <div className="space-y-4">
                    <div className="text-9xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                      {countdown}
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">
                      Dispatching Emergency Nodes...
                    </p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 space-y-4"
                  >
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-tight">
                      <BellRing className="h-5 w-5 animate-bounce" />
                      SOS Network Active
                    </div>
                    <div className="space-y-2">
                      {contacts?.map(c => (
                        <div key={c.id} className="text-[10px] text-muted-foreground flex justify-between bg-white/80 p-3 rounded-xl border border-emerald-100">
                          <span className="font-bold text-slate-700">{c.name}</span>
                          <span className="text-emerald-500 font-black uppercase">Signal Dispatched</span>
                        </div>
                      ))}
                      {(!contacts || contacts.length === 0) && (
                        <p className="text-[10px] text-muted-foreground font-medium italic text-center">Broadcasting to public emergency services...</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Location Data */}
              <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Navigation className="h-3.5 w-3.5 fill-primary/20" />
                    Live GPS Telemetry
                  </div>
                  <div className="h-2 w-2 rounded-full bg-destructive animate-ping" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Latitude</p>
                    <p className="text-sm font-mono font-black text-slate-900">40.7128° N</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Longitude</p>
                    <p className="text-sm font-mono font-black text-slate-900">74.0060° W</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full h-14 rounded-2xl border-slate-200 hover:bg-slate-50 font-black text-slate-500 uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
                  onClick={cancelAlert}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel Protocol
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center mt-6 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] px-10">
            Protocol 114-B: Automated rescue request is irreversible after the 10-second fail-safe window.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
