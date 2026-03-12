"use client";

import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, Thermometer, Activity, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ConfigPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const [isSimulating, setIsSimulating] = useState(true);
  const [currentTemp, setCurrentTemp] = useState(37.0);

  // Auto-simulation effect
  useEffect(() => {
    if (!isSimulating || !db || !user) return;

    const interval = setInterval(() => {
      const nextTemp = Math.min(41, Math.max(36, currentTemp + (Math.random() - 0.45) * 0.2));
      setCurrentTemp(nextTemp);
      
      const vitalsRef = collection(db, 'users', user.uid, 'vitalsReadings');
      addDocumentNonBlocking(vitalsRef, {
        userId: user.uid,
        timestamp: new Date().toISOString(),
        bodyTemperatureC: nextTemp,
        heartRateBPM: 70 + Math.floor(Math.random() * 30),
        activityLevel: 'moderate',
        outsideTemperatureC: 34,
        humidityPercentage: 50,
        heatIndexC: 35,
        latitude: 40.7128,
        longitude: -74.0060,
        deviceType: 'AI Simulator'
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isSimulating, currentTemp, db, user]);

  const handleManualTemp = (val: number) => {
    setCurrentTemp(val);
    if (!db || !user) return;
    
    const vitalsRef = collection(db, 'users', user.uid, 'vitalsReadings');
    addDocumentNonBlocking(vitalsRef, {
      userId: user.uid,
      timestamp: new Date().toISOString(),
      bodyTemperatureC: val,
      heartRateBPM: 72,
      activityLevel: 'manual',
      outsideTemperatureC: 32,
      humidityPercentage: 45,
      heatIndexC: 32,
      latitude: 40.7128,
      longitude: -74.0060,
      deviceType: 'Manual Override'
    });
  };

  return (
    <Card className="glass border-white/5 rounded-3xl overflow-hidden">
      <CardHeader className="bg-white/[0.02] border-b border-white/5 p-6">
        <CardTitle className="text-lg flex items-center gap-3 font-black tracking-tight">
          <Settings className="h-5 w-5 text-primary" />
          SYSTEM CONTROLS
        </CardTitle>
        <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Simulator Protocol</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="space-y-1">
              <Label className="text-sm font-black tracking-tight uppercase">Bio-Flux Auto</Label>
              <p className="text-[10px] text-muted-foreground font-medium">Fluctuate vitals naturally</p>
            </div>
            <Switch checked={isSimulating} onCheckedChange={setIsSimulating} />
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" /> Thermal Override
                </Label>
                <span className={`text-sm font-black font-mono px-3 py-1 rounded-lg glass ${currentTemp > 39 ? 'text-secondary' : 'text-primary'}`}>
                  {currentTemp.toFixed(1)}°C
                </span>
              </div>
              <Slider 
                min={36} 
                max={41} 
                step={0.1} 
                disabled={isSimulating}
                value={[currentTemp]} 
                onValueChange={([val]) => handleManualTemp(val)} 
              />
              {isSimulating && (
                <div className="flex items-center gap-2 text-[10px] text-primary/60 italic font-bold">
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                  Auto-sync active. Disable to override.
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
              <p className="text-[10px] font-black text-secondary uppercase tracking-widest leading-relaxed">
                Danger Threshold Test: Set above 40.0°C to trigger emergency protocols.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
