"use client";

import { useAppContext } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, Thermometer, Heart, Radio, Activity } from 'lucide-react';

export function ConfigPanel() {
  const { thresholds, updateThresholds, isSimulating, toggleSimulation, setVitals, vitals } = useAppContext();

  return (
    <Card className="glass border-white/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Simulation Control
        </CardTitle>
        <CardDescription>Adjust vital parameters for testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">Auto-Simulation</Label>
              <p className="text-[10px] text-muted-foreground">Fluctuate vitals naturally</p>
            </div>
            <Switch checked={isSimulating} onCheckedChange={(val) => toggleSimulation(val)} />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-secondary" /> Danger Threshold
                </Label>
                <span className="text-xs font-mono font-bold text-secondary">{thresholds.tempMax.toFixed(1)}°C</span>
              </div>
              <Slider 
                min={38} 
                max={42} 
                step={0.1} 
                value={[thresholds.tempMax]} 
                onValueChange={([val]) => updateThresholds({ ...thresholds, tempMax: val })} 
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" /> Manual Body Temp
                </Label>
                <span className="text-xs font-mono font-bold text-white">{vitals.bodyTemperature.toFixed(1)}°C</span>
              </div>
              <Slider 
                min={36} 
                max={41} 
                step={0.1} 
                disabled={isSimulating}
                value={[vitals.bodyTemperature]} 
                onValueChange={([val]) => setVitals({ bodyTemperature: val })} 
              />
              {isSimulating && <p className="text-[10px] text-primary/60 italic">Disable simulation to override manually</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
