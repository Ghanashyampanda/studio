"use client";

import { useAppContext } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, Thermometer, Heart, Radio } from 'lucide-react';

export function ConfigPanel() {
  const { thresholds, updateThresholds, isSimulating, toggleSimulation, setVitals, vitals } = useAppContext();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          System Controls
        </CardTitle>
        <CardDescription>Adjust thresholds and device simulation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Wearable Simulation</Label>
              <p className="text-xs text-muted-foreground">Mock live biometric data flux</p>
            </div>
            <Switch checked={isSimulating} onCheckedChange={(val) => toggleSimulation(val)} />
          </div>
          
          <div className="pt-4 border-t space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Thermometer className="h-3 w-3" /> Max Body Temperature
                </Label>
                <span className="text-xs font-mono font-bold text-primary">{thresholds.tempMax.toFixed(1)}°C</span>
              </div>
              <Slider 
                min={38} 
                max={42} 
                step={0.1} 
                value={[thresholds.tempMax]} 
                onValueChange={([val]) => updateThresholds({ ...thresholds, tempMax: val })} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Max Heart Rate
                </Label>
                <span className="text-xs font-mono font-bold text-primary">{thresholds.hrMax} BPM</span>
              </div>
              <Slider 
                min={100} 
                max={200} 
                step={1} 
                value={[thresholds.hrMax]} 
                onValueChange={([val]) => updateThresholds({ ...thresholds, hrMax: val })} 
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Radio className="h-3 w-3" /> Manual Input (Override)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Humidity %</Label>
                <Slider 
                  min={0} max={100} value={[vitals.humidity]} 
                  onValueChange={([v]) => setVitals({ humidity: v })} 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Activity</Label>
                <select 
                  className="w-full text-xs h-8 rounded border bg-background px-2"
                  value={vitals.activityLevel}
                  onChange={(e) => setVitals({ activityLevel: e.target.value as any })}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
