
"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
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
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const NEARBY_HOSPITALS = [
  { id: 'h1', name: 'Central Medical Center', distance: '0.8 km', time: '3 min', status: 'Emergency Dept Open', phone: '555-0199', lat: 40.7138, lng: -74.0050 },
  { id: 'h2', name: 'St. Jude General Hospital', distance: '1.4 km', time: '6 min', status: 'Level 1 Trauma', phone: '555-0211', lat: 40.7118, lng: -74.0080 },
  { id: 'h3', name: 'Metropolis Health Hub', distance: '2.5 km', time: '12 min', status: 'Specialized Burn Unit', phone: '555-0344', lat: 40.7158, lng: -74.0030 },
];

export default function LocationPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedHospital, setSelectedHospital] = useState(NEARBY_HOSPITALS[0]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      toast({
        title: "Telemetry Broadcast Active",
        description: "Your live coordinates have been shared with your emergency network.",
      });
    }, 2000);
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-slate-900 pt-16 flex flex-col lg:flex-row font-body">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-96 bg-white z-20 shadow-2xl flex flex-col border-r border-slate-100 h-[45vh] lg:h-auto overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Navigation className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Command</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Live <span className="text-primary">Telemetry</span></h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Real-time rescue coordination</p>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Current Location Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Position</span>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-700">40.7128° N, 74.0060° W</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">New York, Financial District</p>
              </div>
            </div>
          </div>

          {/* Hospital List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">Nearby Care Nodes</h2>
              <Badge variant="outline" className="text-[9px] border-emerald-100 text-emerald-600 bg-emerald-50">3 Found</Badge>
            </div>
            <div className="space-y-2">
              {NEARBY_HOSPITALS.map(hospital => (
                <button
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    selectedHospital.id === hospital.id 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                    : 'bg-white border-slate-100 hover:border-primary/20 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Hospital className={`h-4 w-4 ${selectedHospital.id === hospital.id ? 'text-primary' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-black">{hospital.distance}</span>
                  </div>
                  <p className="text-xs font-black uppercase tracking-tight truncate">{hospital.name}</p>
                  <div className="flex items-center gap-2 mt-1 opacity-70">
                    <Clock className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase">{hospital.time} ETA</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
          <Button 
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
          >
            {isBroadcasting ? (
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-spin" /> SynchronizingSOS...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Broadcast SOS Location
              </span>
            )}
          </Button>
        </div>
      </aside>

      {/* Map View Area */}
      <main className="flex-1 relative bg-slate-800 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-40 grayscale pointer-events-none">
          <img 
            src="https://picsum.photos/seed/mapview/1920/1080" 
            alt="Map Grid" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Map UI Elements */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-slate-900/90 backdrop-blur text-white p-4 rounded-2xl border border-white/10 shadow-2xl flex gap-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Heading</p>
                <p className="text-lg font-mono font-black tracking-tighter">124° SE</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Velocity</p>
                <p className="text-lg font-mono font-black tracking-tighter">1.2 m/s</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button size="icon" className="h-12 w-12 rounded-xl bg-white text-slate-900 shadow-2xl hover:bg-slate-50">
                <Crosshair className="h-6 w-6" />
              </Button>
              <Button size="icon" className="h-12 w-12 rounded-xl bg-white text-slate-900 shadow-2xl hover:bg-slate-50">
                <Search className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* User Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full animate-ping scale-150 opacity-20" />
              <div className="absolute inset-0 bg-primary rounded-full animate-pulse scale-125 opacity-40" />
              <div className="h-6 w-6 bg-primary rounded-full border-4 border-white shadow-xl relative z-10" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded whitespace-nowrap shadow-xl">
                Critical Node: You
              </div>
            </div>
          </div>

          {/* Floating Hospital Info */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedHospital.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="max-w-md bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <Badge className="bg-destructive/10 text-destructive border-none text-[9px] font-black uppercase tracking-widest">Target Care Node</Badge>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{selectedHospital.name}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary bg-primary/5">
                  <PhoneCall className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                  <p className="text-[10px] font-bold text-slate-700">{selectedHospital.status}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">ETA</p>
                  <p className="text-[10px] font-bold text-slate-700">{selectedHospital.time}</p>
                </div>
              </div>

              <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px]">
                Route to Facility <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
