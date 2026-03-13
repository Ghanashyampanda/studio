
"use client";

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, X, Navigation, Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { sendEmergencyFcm } from '@/app/actions/alerts';

export default function AlertSimPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [dispatchStep, setDispatchStep] = useState(0); 
  const [isSignaling, setIsSignaling] = useState(false);
  
  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

  useEffect(() => {
    if (countdown > 0 && dispatchStep === 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && dispatchStep === 0) {
      setDispatchStep(1);
      setIsSignaling(true);
    }
  }, [countdown, dispatchStep]);

  useEffect(() => {
    if (dispatchStep >= 1 && dispatchStep <= 3) {
      const timer = setTimeout(() => {
        dispatchRescue(dispatchStep);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [dispatchStep]);

  const dispatchRescue = async (attempt: number) => {
    if (!db || !user || !contacts) return;
    
    const message = `RESCUE BURST ${attempt}/3: HeatGuard AI detected critical core temperature (40.2°C). Rescue required. Location: https://www.google.com/maps?q=40.7128,-74.0060`;

    // Signally all FCM nodes
    for (const contact of contacts) {
      if (contact.type === 'fcm' || contact.fcmToken) {
        sendEmergencyFcm(contact.fcmToken || 'token-placeholder', message);
      }
    }

    // Log the burst to forensic audit
    const alertRef = collection(db, 'users', user.uid, 'alert_history');
    addDocumentNonBlocking(alertRef, {
      userId: user.uid,
      triggerTimestamp: new Date().toISOString(),
      alertType: `Automated Rescue Burst ${attempt}/3`,
      messageContent: message,
      bodyTemperatureAtAlertC: 40.2,
      status: 'sent',
      locationAtAlertLatitude: 40.7128,
      locationAtAlertLongitude: -74.0060,
      emergencyContactIds: contacts.map(c => c.id),
      protocol: 'FCM High-Priority Signaling'
    });

    if (attempt === 3) {
      setIsSignaling(false);
    }
    setDispatchStep(prev => prev + 1);
  };

  const handleNativeSMSHandoff = () => {
    if (!contacts) return;
    const primaryPhone = contacts.find(c => c.isPrimary && c.phoneNumber)?.phoneNumber || contacts.find(c => c.phoneNumber)?.phoneNumber;
    if (!primaryPhone) return;

    const message = `HEATGUARD SOS: Critical thermal emergency. Rescue required. Live Location: https://www.google.com/maps?q=40.7128,-74.0060`;
    const url = `sms:${primaryPhone}?body=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-body text-slate-900">
      <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
      <AnimatePresence>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full relative z-10">
          <Card className="bg-white border-destructive/20 shadow-2xl rounded-[3rem] overflow-hidden border-2">
            <CardHeader className="text-center bg-destructive/5 p-10">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="mx-auto h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6 shadow-lg shadow-destructive/20">
                <ShieldAlert className="h-10 w-10" />
              </motion.div>
              <CardTitle className="text-3xl font-black text-destructive tracking-tighter uppercase mb-2">Rescue Protocol</CardTitle>
              <div className="flex items-center justify-center gap-2 text-destructive/80 font-bold uppercase tracking-widest text-[10px]">
                <Zap className="h-3 w-3" /> Signaling Sequence Active
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              {dispatchStep === 0 ? (
                <div className="text-center space-y-4">
                  <div className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums">{countdown}</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Rescue Signaling...</p>
                </div>
              ) : isSignaling ? (
                <div className="text-center space-y-6">
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={cn(
                        "h-3 w-12 rounded-full transition-all duration-500",
                        dispatchStep >= i ? "bg-destructive" : "bg-slate-100"
                      )} />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Loader2 className="h-8 w-8 text-destructive animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 uppercase">Signaling Burst {Math.min(dispatchStep, 3)}/3</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">FCM App Nodes Signaling...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                    <p className="text-sm font-black text-emerald-700 uppercase">Cloud Signaling Complete</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none">All nodes archived in forensics.</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-primary uppercase">Direct Rescue Ready</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Send the tactical SOS payload to your primary cellular responder.</p>
                    </div>
                    <Button onClick={handleNativeSMSHandoff} className="w-full h-14 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl">
                      Dispatch Rescue SMS
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="flex items-center gap-2"><Navigation className="h-3.5 w-3.5" /> Live Telemetry</span>
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold text-slate-600">
                  <div>Lat: 40.7128°</div>
                  <div>Lng: -74.0060°</div>
                </div>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs" onClick={() => router.push('/dashboard')}>
                <X className="mr-2 h-4 w-4" /> Exit Rescue Flow
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
