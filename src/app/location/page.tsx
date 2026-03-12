
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
  Search,
  PhoneCall,
  Activity,
  Layers,
  ChevronRight,
  AlertTriangle,
  Map as MapIcon,
  Globe,
  Mountain
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
  { id: 'hot', name: 'Humanitarian', icon: Globe },
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

  // Attempt to get real-time location
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
      // Use Google Maps for Satellite View as requested
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=17&ie=UTF8&iwloc=&output=embed`;
    }
    // Use OSM for other layers
    return `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng-0.005}%2C${coords.lat-0.005}%2C${coords.lng+0.005}%2C${coords.lat+0.005}&layer=${currentLayer}&marker=${coords.lat}%2C${coords.lng}`;
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-slate-900 pt-16 flex flex-col lg:flex-row font-body overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-[400px] bg-white z-20 shadow-2xl flex flex-col border-r border-slate-100 h-[45vh] lg:h-auto overflow-y-auto shrink-0">
        <div className="p-8 border-b border-slate-100 space-y-4">
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
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none">Live <span className="text-primary">Telemetry</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Precision Rescue Coordination</p>
          </div>
        </div>

        <div className="flex-1 p-8 space-y-8">
          {/* Current Position Metrics */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Core Position</h2>
                <Button variant="ghost" size="sm" onClick={findMe} disabled={isLocating} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">
                  <Crosshair className={cn("h-3 w-3 mr-1.5", isLocating && "animate-spin")} /> Re-Sync
                </Button>
             </div>
             <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black font-mono tracking-tight text-slate-900">{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° W</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Reference Frame</p>
                </div>
             </div>
          </div>

          {/* Hospital/Care Nodes */}
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
                    "w-full text-left p-6 rounded-[2rem] transition-all border-2 group",
                    selectedHospital.id === hospital.id 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' 
                    : 'bg-white border-slate-50 hover:border-primary/20 text-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", selectedHospital.id === hospital.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>
                      <Hospital className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black">{hospital.distance}</p>
                      <p className={cn("text-[9px] font-bold uppercase", selectedHospital.id === hospital.id ? "text-primary-foreground/60" : "text-slate-400")}>{hospital.time} ETA</p>
                    </div>
                  </div>
                  <p className="text-sm font-black uppercase tracking-tight">{hospital.name}</p>
                  <div className="flex items-center gap-2 mt-2 opacity-60">
                    <div className="h-1 w-1 rounded-full bg-current" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{hospital.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <Button 
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="w-full h-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 transition-all active:scale-95"
          >
            {isBroadcasting ? (
              <span className="flex items-center gap-3">
                <Activity className="h-5 w-5 animate-spin" /> Network Broadcast Active...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Share2 className="h-5 w-5" /> Broadcast SOS Location
              </span>
            )}
          </Button>
          <p className="text-[9px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest px-6">
            Broadcast initiates real-time telemetry sharing with all designated rescue nodes.
          </p>
        </div>
      </aside>

      {/* Map View Area */}
      <main className="flex-1 relative bg-slate-100 overflow-hidden min-h-[400px]">
        {/* Interactive Map Layer */}
        <iframe 
          key={`${coords.lat}-${coords.lng}-${currentLayer}`}
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0} 
          src={getMapSrc()}
          className={cn(
            "absolute inset-0 transition-all duration-700",
            isTacticalMode && "grayscale contrast-125 opacity-70"
          )}
        />

        {/* Tactical Overlays */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl text-white p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex gap-10"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Heading</p>
                <p className="text-2xl font-mono font-black tracking-tighter">042° NE</p>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Altitude</p>
                <p className="text-2xl font-mono font-black tracking-tighter">14 m MSL</p>
              </div>
            </motion.div>

            <div className="pointer-events-auto flex flex-col gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="h-14 w-14 rounded-2xl bg-white/90 backdrop-blur text-slate-900 shadow-2xl border border-white hover:bg-white transition-all">
                    <Layers className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 border-none shadow-2xl bg-white/95 backdrop-blur">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-2">Map Layers</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {MAP_LAYERS.map(layer => (
                    <DropdownMenuItem 
                      key={layer.id}
                      onClick={() => setCurrentLayer(layer.id)}
                      className={cn(
                        "rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between",
                        currentLayer === layer.id ? "bg-primary/10 text-primary" : "text-slate-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <layer.icon className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-tight">{layer.name}</span>
                      </div>
                      {currentLayer === layer.id && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsTacticalMode(!isTacticalMode)}
                    className={cn(
                      "rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between",
                      isTacticalMode ? "bg-secondary/10 text-secondary" : "text-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-tight">Tactical Filter</span>
                    </div>
                    <div className={cn("h-4 w-8 rounded-full transition-colors relative", isTacticalMode ? "bg-secondary" : "bg-slate-200")}>
                      <motion.div 
                        animate={{ x: isTacticalMode ? 16 : 2 }}
                        className="absolute top-1 h-2 w-2 rounded-full bg-white"
                      />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="icon" onClick={findMe} className="h-14 w-14 rounded-2xl bg-white/90 backdrop-blur text-slate-900 shadow-2xl border border-white hover:bg-white transition-all">
                <Crosshair className={cn("h-6 w-6", isLocating && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* User Beacon Animation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 bg-primary rounded-full -m-8"
              />
              <div className="h-10 w-10 bg-primary rounded-full border-[6px] border-white shadow-2xl relative z-10" />
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl whitespace-nowrap shadow-2xl border border-white/10">
                Primary Beacon: You
              </div>
            </div>
          </div>

          {/* Target Facility Visualizer */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedHospital.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-white pointer-events-auto relative group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-destructive/10 text-destructive border-none text-[9px] font-black uppercase tracking-widest px-3">Target Care Facility</Badge>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{selectedHospital.name}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all">
                  <PhoneCall className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Response</p>
                    <p className="text-xs font-black text-slate-900">{selectedHospital.time}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</p>
                    <p className="text-xs font-black text-slate-900">Online</p>
                  </div>
                </div>
              </div>

              <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:gap-4">
                Establish Navigation Route <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
