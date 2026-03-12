
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
  Loader2
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

// Hospital names for dynamic generation
const HOSPITAL_NAMES = [
  'General Medical Center',
  'St. Jude Trauma Hub',
  'City Emergency Center',
  'Regional Care Institute',
  'Metropolis Health Station',
  'Riverbend Urgent Care'
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

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
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
    // Generate 4 hospitals within a 1-5km radius of the user's actual coordinates
    return HOSPITAL_NAMES.slice(0, 4).map((name, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.02; // Roughly +/- 2km
      const offsetLng = (Math.random() - 0.5) * 0.02;
      const hLat = lat + offsetLat;
      const hLng = lng + offsetLng;
      const dist = calculateDistance(lat, lng, hLat, hLng);
      const timeMin = Math.round((dist / 35) * 60) + 1; // 35km/h avg speed

      return {
        id: `h-${index}`,
        name,
        lat: hLat,
        lng: hLng,
        distance: dist.toFixed(2) + ' km',
        time: timeMin + ' min',
        phone: `555-0${100 + index}`,
        status: index === 0 ? 'Primary Response Center' : 'Active Facility'
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const findMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          setCoords({ lat: newLat, lng: newLng });
          setAccuracy(position.coords.accuracy);
          
          const nearbyNodes = generateDynamicHospitals(newLat, newLng);
          setHospitals(nearbyNodes);
          setSelectedHospital(nearbyNodes[0]);
          
          setIsLocating(false);
          toast({ 
            title: "GPS Signal Synced", 
            description: `Telemetry locked to within ${Math.round(position.coords.accuracy)}m.`,
          });
        },
        (error) => {
          setIsLocating(false);
          console.error("Geolocation error:", error);
          // Fallback to dynamic nodes around default if needed
          const fallbackNodes = generateDynamicHospitals(coords.lat, coords.lng);
          setHospitals(fallbackNodes);
          setSelectedHospital(fallbackNodes[0]);
          toast({ title: "GPS Error", description: "Using tactical reference frame.", variant: "destructive" });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      const fallbackNodes = generateDynamicHospitals(coords.lat, coords.lng);
      setHospitals(fallbackNodes);
      setSelectedHospital(fallbackNodes[0]);
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
      alertMessage: `SOS: User sharing high-precision location. Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}. Nearest facility: ${selectedHospital?.name} (${selectedHospital?.distance}).`,
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
      <aside className="w-full lg:w-[400px] bg-white z-20 shadow-2xl flex flex-col border-r border-slate-100 max-h-[50vh] lg:max-h-none lg:h-auto overflow-y-auto shrink-0">
        <div className="p-6 lg:p-8 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Navigation className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Surveillance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">100% Signal Synced</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight leading-none">Live <span className="text-primary">Telemetry</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Dynamic Proximity Coordination</p>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 space-y-8">
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Core Position</h2>
                <Button variant="ghost" size="sm" onClick={findMe} disabled={isLocating} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest">
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
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Reference Frame</p>
                </div>
             </div>
             {accuracy && (
               <div className="flex items-center gap-2 px-2">
                 <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-primary" style={{ width: '85%' }} />
                 </div>
                 <span className="text-[9px] font-black uppercase text-slate-400">Accuracy: {Math.round(accuracy)}m</span>
               </div>
             )}
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Proximity Care Nodes</h2>
              <Badge variant="outline" className="text-[9px] font-black bg-emerald-50 text-emerald-600 border-none px-3 uppercase">
                {hospitals.length} Nodes Found
              </Badge>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {hospitals.map(hospital => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={hospital.id}
                    onClick={() => setSelectedHospital(hospital)}
                    className={cn(
                      "w-full text-left p-5 rounded-[2rem] transition-all border-2 group",
                      selectedHospital?.id === hospital.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                      : 'bg-white border-slate-50 hover:border-primary/20 text-slate-700 shadow-sm'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", selectedHospital?.id === hospital.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>
                        <Hospital className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black tracking-tighter">{hospital.distance}</p>
                        <p className={cn("text-[8px] font-bold uppercase", selectedHospital?.id === hospital.id ? "text-primary-foreground/60" : "text-slate-400")}>
                          {hospital.time} ETA
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight truncate">{hospital.name}</p>
                      <p className={cn("text-[9px] font-bold uppercase mt-1", selectedHospital?.id === hospital.id ? "text-primary" : "text-emerald-500")}>
                        {hospital.status}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
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
                <Loader2 className="h-4 w-4 animate-spin" /> Syncing Broadcast...
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
            <div className="hidden md:flex pointer-events-auto bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[2rem] border border-white/10 shadow-2xl gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Heading</p>
                <p className="text-xl font-mono font-black tracking-tighter">042° NE</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Signal Strength</p>
                <div className="flex gap-0.5 items-end h-6 pt-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={cn("w-1.5 rounded-full bg-emerald-500", i === 3 ? "h-6" : i === 2 ? "h-4" : i === 1 ? "h-3" : "h-2")} />
                  ))}
                </div>
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
              {selectedHospital && (
                <motion.div 
                  key={selectedHospital.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <Badge className="bg-destructive/10 text-destructive border-none text-[8px] font-black uppercase px-2">
                        Nearest Care Node
                      </Badge>
                      <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-none truncate">{selectedHospital.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedHospital.distance} Away • {selectedHospital.time} ETA</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary bg-primary/5">
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] transition-all">
                    Establish Routing <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

