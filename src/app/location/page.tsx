
"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { 
  MapPin, 
  Navigation, 
  Hospital, 
  Share2, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Crosshair,
  PhoneCall,
  Activity,
  Layers,
  ChevronRight,
  AlertTriangle,
  Map as MapIcon,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NEARBY_HOSPITALS = [
  { id: 'h1', name: 'Central Medical Center', distance: '0.8 km', time: '3 min', status: 'Emergency Dept Open', phone: '555-0199', lat: 40.7138, lng: -74.0050 },
  { id: 'h2', name: 'St. Jude General Hospital', distance: '1.4 km', time: '6 min', status: 'Level 1 Trauma', phone: '555-0211', lat: 40.7118, lng: -74.0080 },
  { id: 'h3', name: 'Metropolis Health Hub', distance: '2.5 km', time: '12 min', status: 'Specialized Burn Unit', phone: '555-0344', lat: 40.7158, lng: -74.0030 },
];

const MAP_LAYERS = [
  { id: 'mapnik', name: 'Standard', icon: MapIcon },
  { id: 'satellite', name: 'Satellite', icon: Globe },
  { id: 'cyclemap', name: 'Cycling', icon: Activity },
  { id: 'transportmap', name: 'Transport', icon: Navigation },
];

export default function LocationPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 });
  const [selectedHospital, setSelectedHospital] = useState(NEARBY_HOSPITALS[0]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('mapnik');
  const [isTacticalMode, setIsTacticalMode] = useState(false);

  const findMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          toast({ title: "Signal Synced", description: "Telemetry locked to current GPS node." });
        },
        () => {
          setIsLocating(false);
          toast({ title: "GPS Error", description: "Defaulting to secure simulated coordinates.", variant: "destructive" });
        }
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
      alertType: 'Manual SOS Broadcast',
      status: 'sent',
      bodyTemperatureAtAlertC: 37.0, 
      locationAtAlertLatitude: coords.lat,
      locationAtAlertLongitude: coords.lng,
      alertMessage: `MANUAL SOS: User is sharing live location. Coordinates: ${coords.lat}, ${coords.lng}`,
      emergencyContactIds: [] 
    });

    setTimeout(() => {
      setIsBroadcasting(false);
      toast({
        title: "Telemetry Broadcast Active",
        description: "Your live coordinates have been shared with your emergency network.",
      });
    }, 5000);
  };

  const getMapSrc = () => {
    if (currentLayer === 'satellite') {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=17&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng-0.005}%2C${coords.lat-0.005}%2C${coords.lng+0.005}%2C${coords.lat+0.005}&layer=${currentLayer}&marker=${coords.lat}%2C${coords.lng}`;
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-slate-900 pt-16 flex flex-col lg:flex-row font-body overflow-hidden">
      <aside className="w-full lg:w-[400px] bg-white z-20 shadow-2xl flex flex-col border-r border-slate-100 max-h-[50vh] lg:max-h-none lg:h-auto overflow-y-auto shrink-0">
        <div className="p-6 lg:p-8 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Navigation className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Surveillance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Link</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight leading-none">Live <span className="text-primary">Telemetry</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Precision Rescue Coordination</p>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 space-y-8">
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Core Position</h2>
                <Button variant="ghost" size="sm" onClick={findMe} disabled={isLocating} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">
                  <Crosshair className={cn("h-3 w-3 mr-1.5", isLocating && "animate-spin")} /> Re-Sync
                </Button>
             </div>
             <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black font-mono tracking-tight text-slate-900">{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° W</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Reference Frame</p>
                </div>
             </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Nearby Care Nodes</h2>
              <Badge variant="outline" className="text-[9px] font-black bg-emerald-50 text-emerald-600 border-none px-3 uppercase">3 Detected</Badge>
            </div>
            <div className="space-y-3">
              {NEARBY_HOSPITALS.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                  className={cn(
                    "w-full text-left p-5 rounded-[2rem] transition-all border-2 group",
                    selectedHospital.id === hospital.id 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                    : 'bg-white border-slate-50 hover:border-primary/20 text-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", selectedHospital.id === hospital.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>
                      <Hospital className="h-4 w-4" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black">{hospital.distance}</p>
                      <p className={cn("text-[8px] font-bold uppercase", selectedHospital.id === hospital.id ? "text-primary-foreground/60" : "text-slate-400")}>{hospital.time} ETA</p>
                    </div>
                  </div>
                  <p className="text-xs font-black uppercase tracking-tight truncate">{hospital.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100">
          <Button 
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="w-full h-14 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all"
          >
            {isBroadcasting ? (
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-spin" /> Broadcasting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Broadcast SOS
              </span>
            )}
          </Button>
        </div>
      </aside>

      <main className="flex-1 relative bg-slate-100 overflow-hidden min-h-[400px] lg:min-h-0">
        <iframe 
          key={`${coords.lat}-${coords.lng}-${currentLayer}`}
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no" 
          src={getMapSrc()}
          className={cn(
            "absolute inset-0 transition-all duration-700",
            isTacticalMode && "grayscale contrast-125 opacity-70"
          )}
        />

        <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="hidden md:flex pointer-events-auto bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[2rem] border border-white/10 shadow-2xl gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Heading</p>
                <p className="text-xl font-mono font-black tracking-tighter">042° NE</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Altitude</p>
                <p className="text-xl font-mono font-black tracking-tighter">14 m</p>
              </div>
            </div>

            <div className="pointer-events-auto flex flex-col gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur text-slate-900 shadow-xl border border-white">
                    <Layers className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-[1.5rem] p-2 bg-white/95 backdrop-blur">
                  <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Map Layers</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {MAP_LAYERS.map(layer => (
                    <DropdownMenuItem 
                      key={layer.id}
                      onClick={() => setCurrentLayer(layer.id)}
                      className={cn(
                        "rounded-xl px-3 py-2.5 cursor-pointer flex items-center justify-between",
                        currentLayer === layer.id ? "bg-primary/10 text-primary" : "text-slate-600"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <layer.icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">{layer.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsTacticalMode(!isTacticalMode)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 cursor-pointer flex items-center justify-between",
                      isTacticalMode ? "bg-secondary/10 text-secondary" : "text-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase">Tactical Filter</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="icon" onClick={findMe} className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur text-slate-900 shadow-xl border border-white">
                <Crosshair className={cn("h-5 w-5", isLocating && "animate-spin")} />
              </Button>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 bg-primary rounded-full -m-8"
              />
              <div className="h-8 w-8 bg-primary rounded-full border-[4px] border-white shadow-2xl relative z-10" />
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedHospital.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <Badge className="bg-destructive/10 text-destructive border-none text-[8px] font-black uppercase px-2">Nearest Care</Badge>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-none truncate">{selectedHospital.name}</h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary bg-primary/5">
                    <PhoneCall className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] transition-all">
                  Navigate Route <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
