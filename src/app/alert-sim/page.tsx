
"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, X, BellRing, Navigation, AlertTriangle, Phone, MessageSquare } from 'lucide-react';
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

  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

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
      messageContent: `EMERGENCY: User core temperature exceeded 40.0°C. SMS alerts and Emergency Voice Link initiated to rescue network.`,
      bodyTemperatureAtAlertC: 40.2,
      status: 'sent',
      locationAtAlertLatitude: 40.7128,
      locationAtAlertLongitude: -74.0060,
      emergencyContactIds: contacts?.map(c => c.id) || []
    });
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
      <AnimatePresence>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full relative z-10">
          <Card className="bg-white border-destructive/20 shadow-2xl rounded-[3rem] overflow-hidden border-2">
            <CardHeader className="text-center bg-destructive/5 p-10">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="mx-auto h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6 shadow-lg shadow-destructive/20">
                <ShieldAlert className="h-10 w-10" />
              </motion.div>
              <CardTitle className="text-3xl font-black text-destructive tracking-tighter uppercase mb-2">Critical Alert</CardTitle>
              <div className="flex items-center justify-center gap-2 text-destructive/80 font-bold uppercase tracking-widest text-[10px]">
                <AlertTriangle className="h-3 w-3" /> Hyperthermia Protocol Active
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              {!isAlertSent ? (
                <div className="text-center space-y-4">
                  <div className="text-8xl font-black text-slate-900 tracking-tighter tabular-nums">{countdown}</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Dispatching Rescue Nodes...</p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-6">
                  <div className="flex justify-center gap-4">
                    <Phone className="h-6 w-6 text-emerald-600 animate-bounce" />
                    <MessageSquare className="h-6 w-6 text-emerald-600 animate-bounce delay-100" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-emerald-700 uppercase">Emergency Protocol Deployed</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Call + SMS Link Active</p>
                  </div>
                  <div className="space-y-2 border-t border-emerald-100 pt-4">
                    {contacts?.map(c => (
                      <div key={c.id} className="text-[9px] text-emerald-500 font-bold uppercase tracking-tight flex items-center justify-center gap-2">
                        <span>{c.name}</span>
                        <span className="h-1 w-1 bg-emerald-300 rounded-full" />
                        <span>SMS & Call Dispatched</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="flex items-center gap-2"><Navigation className="h-3.5 w-3.5" /> GPS Broadcast</span>
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold text-slate-600">
                  <div>Lat: 40.7128° N</div>
                  <div>Lng: 74.0060° W</div>
                </div>
              </div>
              <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs" onClick={() => router.push('/dashboard')}>
                <X className="mr-2 h-4 w-4" /> Abort Protocol
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
