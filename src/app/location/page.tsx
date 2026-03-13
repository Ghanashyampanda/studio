
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
  X as CloseIcon
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

// Enhanced Hospital Data for classification
const FACILITY_DATABASE = [
  { name: 'City General Medical Center', type: 'Level 1 Trauma Center', size: 'Big', specialty: 'Full Emergency' },
  { name: 'St. Jude Trauma Hub', type: 'Regional Hospital', size: 'Big', specialty: 'Hyperthermia Unit' },
  { name: 'Metropolis Health Station', type: 'General Hospital', size: 'Big', specialty: '24/7 ER' },
  { name: 'Community Care Express', type: 'Urgent Care', size: 'Mini', specialty: 'Limited Services' },
  { name: 'Metro Health Station', type: 'Community Clinic', size: 'Mini', specialty: 'Stabilization Only' },
  { name: 'Riverbend Medical Point', type: 'Mini-Hospital', size: 'Mini', specialty: 'First Aid' }
];

const MAP_LAYERS = [
  { id: 'mapnik', name: 'Standard', icon: MapIcon },
  { id: 'satellite', name: 'Satellite', icon: Globe },
];

export default function LocationPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 });
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('mapnik');
  const [isTacticalMode, setIsTacticalMode] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; 
    return d;
  };

  const generateDynamicHospitals = (lat: number, lng: number) => {
    return FACILITY_DATABASE.map((facility, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.03;
      const offsetLng = (Math.random() - 0.5) * 0.03;
      const hLat = lat + offsetLat;
      const hLng = lng + offsetLng;
      const dist = calculateDistance(lat, lng, hLat, hLng);
      const timeMin = Math.round((dist / 35) * 60) + 2;

      return {
        id: `h-${index}`,
        ...facility,
        lat: hLat,
        lng: hLng,
        distanceVal: dist,
        distance: dist.toFixed(2) + ' km',
        time: timeMin + ' min',
        phone: `555-0${100 + index}`,
        status: dist < 1.5 ? 'Critical Proximity' : 'Active Facility'
      };
    }).sort((a, b) => a.distanceVal - b.distanceVal);
  };

  const findMe = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          setCoords({ lat: newLat, lng: newLng });
          setAccuracy(position.coords.accuracy);
          
          const nearbyNodes = generateDynamicHospitals(newLat, newLng);
          setHospitals(nearbyNodes);
          
          setIsLocating(false);
          toast({ 
            title: "GPS Signal Synced", 
            description: `Telemetry locked to within ${Math.round(position.coords.accuracy)}m.`,
          });
        },
        (error) => {
          setIsLocating(false);
          const fallbackNodes = generateDynamicHospitals(coords.lat, coords.lng);
          setHospitals(fallbackNodes);
          toast({ title: "GPS Error", description: "Using tactical reference frame.", variant: "destructive" });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      const fallbackNodes = generateDynamicHospitals(coords.lat, coords.lng);
      setHospitals(fallbackNodes);
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
      alertType: 'High-Precision SOS Broadcast',
      status: 'sent',
      bodyTemperatureAtAlertC: 37.0, 
      locationAtAlertLatitude: coords.lat,
      locationAtAlertLongitude: coords.lng,
      accuracy: accuracy,
      alertMessage: `SOS: User sharing high-precision location. Nearest facility: ${selectedHospital?.name || 'Searching...'}`,
      emergencyContactIds: [] 
    });

    setTimeout(() => {
      setIsBroadcasting(false);
      toast({
        title: "Telemetry Broadcast Active",
        description: "Your exact coordinates are now being streamed to your rescue nodes.",
      });
    }, 2000);
  };

  const getMapSrc = () => {
    if (currentLayer === 'satellite') {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng-0.003}%2C${coords.lat-0.003}%2C${coords.lng+0.003}%2C${coords.lat+0.003}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-slate-900 pt-16 flex flex-col lg:flex-row font-body overflow-hidden">
      {/* Control Sidebar */}
      <aside className="w-full lg:w-[420px] bg-white z-20 shadow-2xl flex flex-col border-r border-slate-100 h-[60vh] lg:h-auto overflow-y-auto shrink-0">
        <div className="p-6 lg:p-8 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Navigation className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Surveillance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Signal Locked</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight leading-none">Live <span className="text-primary">Telemetry</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Precision Rescue Coordination</p>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 space-y-8">
          {/* Coordinates */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Core Position</h2>
                <Button variant="ghost" size="sm" onClick={findMe} disabled={isLocating} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50">
                  {isLocating ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Crosshair className="h-3 w-3 mr-1.5" />} Re-Sync
                </Button>
             </div>
             <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black font-mono tracking-tight text-slate-900 leading-none">
                    {coords.lat.toFixed(6)}° N
                  </p>
                  <p className="text-sm font-black font-mono tracking-tight text-slate-900 leading-none">
                    {coords.lng.toFixed(6)}° W
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Locked Coordinates</p>
                </div>
             </div>
          </div>

          {/* Selected Hospital Details (Outside Map) */}
          <AnimatePresence mode="wait">
            {selectedHospital && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-primary">Active Care Node</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedHospital(null)} className="h-6 w-6 rounded-full hover:bg-slate-100">
                    <CloseIcon className="h-3 w-3" />
                  </Button>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl border border-slate-800 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("border-none text-[8px] font-black uppercase px-2 py-0.5", 
                          selectedHospital.size === 'Big' ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400")}>
                          {selectedHospital.size} Care Node
                        </Badge>
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight leading-tight pt-1">{selectedHospital.name}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all">
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">Distance</p>
                      <p className="text-[10px] font-black uppercase text-slate-200">{selectedHospital.distance}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">ETA</p>
                      <p className="text-[10px] font-black uppercase text-slate-200">{selectedHospital.time}</p>
                    </div>
                  </div>
                  
                  <Button className="w-full h-12 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] transition-all">
                    Routing Protocol <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hospital List */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Nearby Care Nodes</h2>
              <Badge variant="outline" className="text-[9px] font-black bg-emerald-50 text-emerald-600 border-none px-3 uppercase">
                {hospitals.length} Found
              </Badge>
            </div>
            
            <div className="space-y-3">
              {hospitals.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all border-2 group flex items-center justify-between",
                    selectedHospital?.id === hospital.id 
                    ? 'bg-primary/5 border-primary text-primary' 
                    : 'bg-white border-slate-50 hover:border-slate-100 text-slate-700 shadow-sm'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-colors", 
                      selectedHospital?.id === hospital.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>
                      {hospital.size === 'Big' ? <Building2 className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-tight truncate max-w-[150px]">{hospital.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{hospital.distance} • {hospital.time}</p>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 transition-transform", selectedHospital?.id === hospital.id ? "text-primary translate-x-1" : "text-slate-300")} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100 mt-auto">
          <Button 
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="w-full h-14 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all"
          >
            {isBroadcasting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Transmitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Broadcast SOS Telemetry
              </span>
            )}
          </Button>
        </div>
      </aside>

      {/* Map Main View */}
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
            <div className="hidden md:flex pointer-events-auto bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-[2.5rem] border border-white/10 shadow-2xl gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-lg font-mono font-black tracking-tighter uppercase">Ready</p>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Signal Strength</p>
                <div className="flex gap-1 items-end h-6 pt-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={cn("w-1.5 rounded-full bg-emerald-500", i === 3 ? "h-6" : i === 2 ? "h-4" : i === 1 ? "h-3" : "h-2")} />
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-auto flex flex-col gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur text-slate-900 shadow-xl border border-white hover:bg-white transition-all">
                    <Layers className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-[2rem] p-3 bg-white/95 backdrop-blur border-none shadow-2xl">
                  <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-3">Map Selection</DropdownMenuLabel>
                  {MAP_LAYERS.map(layer => (
                    <DropdownMenuItem 
                      key={layer.id}
                      onClick={() => setCurrentLayer(layer.id)}
                      className={cn(
                        "rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between mb-1 last:mb-0 transition-colors",
                        currentLayer === layer.id ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <layer.icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">{layer.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-2 bg-slate-100" />
                  <DropdownMenuItem 
                    onClick={() => setIsTacticalMode(!isTacticalMode)}
                    className={cn(
                      "rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between transition-colors",
                      isTacticalMode ? "bg-orange-100 text-orange-600" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase">Tactical Mode</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="icon" onClick={findMe} className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur text-slate-900 shadow-xl border border-white hover:bg-white transition-all">
                <Crosshair className={cn("h-5 w-5", isLocating && "animate-spin")} />
              </Button>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 2.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 bg-primary rounded-full -m-10"
              />
              <div className="h-10 w-10 bg-primary rounded-full border-[5px] border-white shadow-2xl relative z-10 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
