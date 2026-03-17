"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { 
  MapPin, 
  Navigation, 
  Hospital, 
  Share2, 
  ShieldAlert, 
  ArrowRight,
  Crosshair,
  PhoneCall,
  Activity,
  Layers,
  ChevronRight,
  Map as MapIcon,
  Globe,
  Loader2,
  Building2,
  Stethoscope,
  Clock,
  Building,
  X as CloseIcon,
  Locate,
  Route as RouteIcon,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from '@/components/ui/card';

const FACILITY_DATABASE = [
  { name: 'City General Medical Center', type: 'Level 1 Trauma Center', size: 'Big', specialty: 'Full Emergency' },
  { name: 'St. Jude Thermal Trauma Hub', type: 'Regional Hospital', size: 'Big', specialty: 'Hyperthermia Unit' },
  { name: 'Metropolis Health Station', type: 'General Hospital', size: 'Big', specialty: '24/7 ER' },
  { name: 'Community Care Express', type: 'Urgent Care', size: 'Mini', specialty: 'Limited Services' },
  { name: 'Metro Stabilization Clinic', type: 'Community Clinic', size: 'Mini', specialty: 'Stabilization Only' },
  { name: 'Riverbend Rapid Response Point', type: 'Mini-Hospital', size: 'Mini', specialty: 'First Aid' }
];

const MAP_LAYERS = [
  { id: 'roadmap', name: 'Standard', icon: MapIcon },
  { id: 'satellite', name: 'Satellite', icon: Globe },
];

export default function LocationPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('roadmap');
  const [isTacticalMode, setIsTacticalMode] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  const hospitals = useMemo(() => {
    return FACILITY_DATABASE.map((facility, index) => {
      // Create geographic distribution around the current user anchor
      const offsetLat = (Math.sin(index * 1.5) * 0.035);
      const offsetLng = (Math.cos(index * 1.5) * 0.035);
      const hLat = coords.lat + offsetLat;
      const hLng = coords.lng + offsetLng;
      const dist = calculateDistance(coords.lat, coords.lng, hLat, hLng);
      const timeMin = Math.max(2, Math.round((dist / 35) * 60));

      return {
        id: `h-${index}`,
        ...facility,
        lat: hLat,
        lng: hLng,
        distanceVal: dist,
        distance: dist.toFixed(2) + ' km',
        time: timeMin + ' min',
        phone: `555-0${100 + index}`,
      };
    }).sort((a, b) => a.distanceVal - b.distanceVal);
  }, [coords.lat, coords.lng]);

  const selectedHospital = useMemo(() => 
    hospitals.find(h => h.id === selectedHospitalId), 
  [hospitals, selectedHospitalId]);

  const findMe = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
          setIsLocating(false);
          toast({ 
            title: "Tactical GPS Sync Successful", 
            description: "Surrounding medical nodes localized.",
          });
        },
        () => {
          setIsLocating(false);
          toast({ title: "GPS Timeout", description: "Using regional tactical coordinates.", variant: "destructive" });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    findMe();
  }, []);

  const handleBroadcast = () => {
    if (!db || !user) return;
    setIsBroadcasting(true);
    const historyRef = collection(db, 'users', user.uid, 'alert_history');
    addDocumentNonBlocking(historyRef, {
      userId: user.uid,
      triggerTimestamp: new Date().toISOString(),
      alertType: 'Live Navigation Broadcast',
      status: 'sent',
      bodyTemperatureAtAlertC: 37.0, 
      locationAtAlertLatitude: coords.lat,
      locationAtAlertLongitude: coords.lng,
      alertMessage: `User tracking destination: ${selectedHospital?.name || 'Local Trauma Center'}`,
      emergencyContactIds: [] 
    });
    setTimeout(() => {
      setIsBroadcasting(false);
      toast({ title: "Broadcast Active", description: "Rescue nodes are receiving your live route telemetry." });
    }, 1500);
  };

  const getFallbackMapUrl = () => {
    const mapType = currentLayer === 'satellite' ? 'k' : 'm';
    if (selectedHospital) {
      return `https://maps.google.com/maps?saddr=${coords.lat},${coords.lng}&daddr=${selectedHospital.lat},${selectedHospital.lng}&t=${mapType}&z=14&output=embed`;
    }
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=${mapType}&z=15&output=embed`;
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 flex flex-col lg:flex-row font-body overflow-hidden">
      <aside className="w-full lg:w-[450px] bg-card z-20 shadow-xl flex flex-col border-r border-border h-[50vh] lg:h-auto overflow-y-auto shrink-0">
        <div className="p-8 border-b border-border space-y-4 bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Navigation className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Rescue Intelligence</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Signal Locked</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-foreground">Nearby <span className="text-primary">Care</span></h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">Discovery of High-Capacity Trauma Nodes</p>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4">
          {hospitals.map(hospital => (
            <button
              key={hospital.id}
              onClick={() => setSelectedHospitalId(hospital.id)}
              className={cn(
                "w-full text-left p-6 rounded-3xl transition-all border-2 group flex items-center justify-between",
                selectedHospitalId === hospital.id 
                ? 'bg-primary/5 border-primary shadow-lg' 
                : 'bg-card border-border hover:border-primary/20 shadow-sm'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-colors shrink-0", 
                  selectedHospitalId === hospital.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {hospital.size === 'Big' ? <Building2 className="h-6 w-6" /> : <Building className="h-6 w-6" />}
                </div>
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-black uppercase tracking-tight text-foreground leading-tight">{hospital.name}</p>
                    <Badge className={cn("text-[7px] font-black uppercase px-2 py-0 border-none", 
                      hospital.size === 'Big' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400")}>
                      {hospital.size}
                    </Badge>
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{hospital.distance} • {hospital.time} ETA</p>
                  <p className="text-[8px] font-black text-primary/60 uppercase tracking-tighter">{hospital.type}</p>
                </div>
              </div>
              <ChevronRight className={cn("h-5 w-5 shrink-0 transition-transform", selectedHospitalId === hospital.id ? "text-primary translate-x-1" : "text-muted")} />
            </button>
          ))}
        </div>

        <div className="p-8 bg-muted/30 border-t border-border mt-auto">
          <Button 
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="w-full h-14 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all"
          >
            {isBroadcasting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            Broadcast SOS Telemetry
          </Button>
        </div>
      </aside>

      <main className="flex-1 relative bg-muted overflow-hidden min-h-[500px] lg:min-h-0">
        <iframe 
          key={`${coords.lat}-${coords.lng}-${selectedHospitalId}-${currentLayer}`}
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no" 
          src={getFallbackMapUrl()}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            isTacticalMode && "grayscale contrast-125 opacity-70"
          )}
        />

        <div className="absolute top-6 left-6 right-6 pointer-events-none z-30">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {selectedHospital ? (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="pointer-events-auto"
                >
                  <Card className="bg-background/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 bg-primary h-full" />
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <RouteIcon className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border-none px-2">Navigation Active</Badge>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Routing to:</span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground leading-none">{selectedHospital.name}</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{selectedHospital.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 md:border-l md:pl-8 border-border">
                      <div className="text-center md:text-left">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Distance</p>
                        <p className="text-2xl font-black text-foreground tracking-tighter">{selectedHospital.distance}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Live ETA</p>
                        <p className="text-2xl font-black text-primary tracking-tighter">{selectedHospital.time}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedHospitalId(null)} className="h-10 w-10 rounded-full hover:bg-muted">
                        <CloseIcon className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pointer-events-auto max-w-sm"
                >
                  <Card className="bg-background/90 backdrop-blur-xl p-5 rounded-[2rem] shadow-xl border border-border flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                      <Info className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Surveillance Grid Ready</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Select a facility to begin routing.</p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 flex flex-col gap-3 pointer-events-auto z-40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-2xl bg-background text-foreground shadow-2xl border border-border hover:bg-muted transition-all">
                <Layers className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[2rem] p-3 bg-background border border-border shadow-2xl">
              <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 pb-3">Map Layers</DropdownMenuLabel>
              {MAP_LAYERS.map(layer => (
                <DropdownMenuItem 
                  key={layer.id}
                  onClick={() => setCurrentLayer(layer.id)}
                  className={cn(
                    "rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between mb-1 transition-colors",
                    currentLayer === layer.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <layer.icon className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase">{layer.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-2 bg-border" />
              <DropdownMenuItem 
                onClick={() => setIsTacticalMode(!isTacticalMode)}
                className={cn(
                  "rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between transition-colors",
                  isTacticalMode ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Tactical Mode</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="icon" onClick={findMe} className="h-14 w-14 rounded-2xl bg-background text-foreground shadow-2xl border border-border hover:bg-muted transition-all">
            <Crosshair className={cn("h-6 w-6", isLocating && "animate-spin")} />
          </Button>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 bg-primary rounded-full -m-10"
            />
            <div className="h-10 w-10 bg-primary rounded-full border-[4px] border-background shadow-2xl relative z-10 flex items-center justify-center">
              <div className="h-2 w-2 bg-background rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}