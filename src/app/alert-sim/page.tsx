"use client";

import { useEffect, useState, useRef } from 'react';
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
import { sendEmergencySms } from '@/app/actions/sms';

export default function AlertSimPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isSignaling, setIsSignaling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentNodeName, setCurrentNodeName] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const hasTriggered = useRef(false);

  // Acquire high-accuracy GPS lock on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.warn("Rescue Protocol: GPS Lock Failed", error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

  useEffect(() => {
    if (countdown > 0 && !isSignaling && !isComplete && user) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isSignaling && !isComplete && user && !hasTriggered.current) {
      startRescueProtocol();
    }
  }, [countdown, isSignaling, isComplete, user]);

  const startRescueProtocol = async () => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    
    setIsSignaling(true);
    if (!db || !user || !contacts) {
      setIsSignaling(false);
      return;
    }
    
    // Default fallback coordinates set to Bhubaneswar, India (Near KIIMS)
    const lat = currentCoords?.lat ?? 20.3517;
    const lng = currentCoords?.lng ?? 85.8189;
    const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `⚠️ Sunstroke Detected! User needs help. Location: ${mapLink}`;

    // SEQUENTIAL BROADCAST: Loop through all contacts and signal every established node
    for (const contact of contacts) {
      setCurrentNodeName(contact.name);
      try {
        if (contact.type === 'fcm' || contact.fcmToken) {
          await sendEmergencyFcm(contact.fcmToken || 'token-placeholder', message);
        }
        if (contact.type === 'phone' || contact.phoneNumber) {
          await sendEmergencySms(contact.phoneNumber || 'phone-placeholder', message);
        }
      } catch (err) {
        console.error(`Alert Sim: Failed to signal ${contact.name}`, err);
      }
      // Brief delay between nodes for realistic simulation
      await new Promise(r => setTimeout(r, 400));
    }

    // Standardized Data Storage as requested
    const alertRef = collection(db, 'users', user.uid, 'alert_history');
    addDocumentNonBlocking(alertRef, {
      message: "⚠️ Sunstroke detected!",
      temperature: 40.7,
      location: { lat, lng },
      timestamp: new Date().toISOString(),
      userId: user.uid,
      triggerTimestamp: new Date().toISOString(),
      alertType: `Automated Rescue Trigger`,
      messageContent: message,
      bodyTemperatureAtAlertC: 40.7,
      status: 'sent',
      locationAtAlertLatitude: lat,
      locationAtAlertLongitude: lng,
      emergencyContactIds: contacts.map(c => c.id),
      protocol: `Multi-Node Broadcast to all ${contacts.length} Responders`
    });

    setIsSignaling(false);
    setIsComplete(true);
  };

  const handleNativeSMSDispatch = () => {
    if (!contacts) return;
    const primaryPhone = contacts.find(c => c.isPrimary && c.phoneNumber)?.phoneNumber || contacts.find(c => c.phoneNumber)?.phoneNumber;
    if (!primaryPhone) return;

    const lat = currentCoords?.lat ?? 20.3517;
    const lng = currentCoords?.lng ?? 85.8189;
    const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `⚠️ Sunstroke Detected! User needs help. Location: ${mapLink}`;
    const url = `sms:${primaryPhone}?body=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-body text-slate-900">
      <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
      <AnimatePresence>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full relative z-10">
          <Card className="bg-white border-destructive shadow-2xl rounded-[3rem] overflow-hidden border-4">
            <CardHeader className="text-center bg-destructive p-10 text-white">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="mx-auto h-20 w-20 bg-white/20 rounded-full flex items-center justify-center text-white mb-6 shadow-lg">
                <ShieldAlert className="h-10 w-10" />
              </motion.div>
              <CardTitle className="text-3xl font-black tracking-tighter uppercase mb-2">Emergency SOS</CardTitle>
              <div className="flex items-center justify-center gap-2 text-white/80 font-bold uppercase tracking-widest text-[10px]">
                <Zap className="h-3 w-3" /> System Escalation Active
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              {!isSignaling && !isComplete ? (
                <div className="text-center space-y-4">
                  <div className="text-8xl font-black text-red-600 tracking-tighter tabular-nums">{countdown}</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Dispatch Sequence...</p>
                </div>
              ) : isSignaling ? (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <Loader2 className="h-8 w-8 text-destructive animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 uppercase">Dispatch Protocol Active</p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse">
                        Signaling Responder: {currentNodeName || 'Establishing Link'}...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                    <p className="text-sm font-black text-emerald-700 uppercase">SOS Dispatched</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none">Emergency contacts notified with live location.</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-primary uppercase">Manual Confirmation</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Send a direct message to your primary contact.</p>
                    </div>
                    <Button onClick={handleNativeSMSDispatch} className="w-full h-14 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl">
                      Send Primary SMS
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="flex items-center gap-2"><Navigation className="h-3.5 w-3.5" /> Broadcast Telemetry</span>
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold text-slate-600">
                  <div>Lat: {currentCoords?.lat.toFixed(4) ?? '20.3517'}°</div>
                  <div>Lng: {currentCoords?.lng.toFixed(4) ?? '85.8189'}°</div>
                </div>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs" onClick={() => router.push('/dashboard')}>
                <X className="mr-2 h-4 w-4" /> Cancel Protocol
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
