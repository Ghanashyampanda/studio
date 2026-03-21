"use client";

import { useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, Thermometer, Activity, RefreshCcw, Waves } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ConfigPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(37.0);
  const [ambientTemp, setAmbientTemp] = useState(32.0);

  // Auto-simulation effect
  useEffect(() => {
    if (!isSimulating || !db || !user) return;

    const interval = setInterval(() => {
      const nextTemp = Math.min(41, Math.max(36, currentTemp + (Math.random() - 0.45) * 0.2));
      setCurrentTemp(nextTemp);
      
      const vitalsRef = collection(db, 'users', user.uid, 'vital_sign_data');
      addDocumentNonBlocking(vitalsRef, {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        bodyTemperatureC: nextTemp,
        heartRateBPM: 70 + Math.floor(Math.random() * 30),
        activityLevel: 'moderate',
        outsideTemperatureC: ambientTemp,
        humidityPercentage: 50,
        heatIndexC: ambientTemp + 3,
        // Simulation localized to Bhubaneswar, India
        latitude: 20.3517,
        longitude: 85.8189,
        deviceType: 'AI Simulator'
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isSimulating, currentTemp, ambientTemp, db, user]);

  const handleUpdate = (temp: number, ambient: number) => {
    setCurrentTemp(temp);
    setAmbientTemp(ambient);
    if (!db || !user) return;
    
    const vitalsRef = collection(db, 'users', user.uid, 'vital_sign_data');
    addDocumentNonBlocking(vitalsRef, {
      userId: user.uid,
      timestamp: new Date().toISOString(),
      bodyTemperatureC: temp,
      heartRateBPM: 72,
      activityLevel: 'manual',
      outsideTemperatureC: ambient,
      humidityPercentage: 45,
      heatIndexC: ambient + 2,
      // Localized manual override coordinates
      latitude: 20.3517,
      longitude: 85.8189,
      deviceType: 'Manual Override'
    });
  };

  return (
    <Card className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border">
      <CardHeader className="bg-muted/30 border-b border-border p-6">
        <CardTitle className="text-lg flex items-center gap-3 font-black tracking-tight uppercase text-foreground">
          <Settings className="h-5 w-5 text-primary" />
          System Input
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
          Manual Physiological Override
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        <div className="space-y-8">
          {/* Body Temp */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                <Thermometer className="h-4 w-4" /> Body Temperature
              </Label>
              <span className={`text-sm font-black font-mono px-3 py-1 rounded-lg bg-muted ${currentTemp > 39 ? 'text-secondary' : 'text-primary'}`}>
                {currentTemp.toFixed(1)}°C
              </span>
            </div>
            <Slider 
              min={36} 
              max={41} 
              step={0.1} 
              value={[currentTemp]} 
              onValueChange={([val]) => handleUpdate(val, ambientTemp)} 
            />
          </div>

          {/* Ambient Temp */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                <Waves className="h-4 w-4" /> Ambient Environment
              </Label>
              <span className="text-sm font-black font-mono px-3 py-1 rounded-lg bg-muted text-foreground">
                {ambientTemp.toFixed(1)}°C
              </span>
            </div>
            <Slider 
              min={15} 
              max={50} 
              step={0.5} 
              value={[ambientTemp]} 
              onValueChange={([val]) => handleUpdate(currentTemp, val)} 
            />
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border">
              <div className="space-y-1">
                <Label className="text-xs font-black tracking-tight uppercase text-foreground">Simulation Mode</Label>
                <p className="text-[9px] text-muted-foreground font-bold uppercase">Dynamic flux (15s cycles)</p>
              </div>
              <Switch checked={isSimulating} onCheckedChange={setIsSimulating} />
            </div>

            {isSimulating && (
              <div className="flex items-center gap-2 text-[10px] text-primary italic font-black uppercase tracking-widest">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Live Telemetry Synchronizing...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
