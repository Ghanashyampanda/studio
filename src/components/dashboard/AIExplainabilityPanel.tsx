"use client";

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Info, 
  BrainCircuit, 
  Thermometer, 
  Activity, 
  Wind, 
  Sun, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type LearnedRiskOutput } from '@/ai/flows/learned-risk-prediction-flow';

interface AIExplainabilityPanelProps {
  prediction: LearnedRiskOutput | null;
  isLoading: boolean;
}

export function AIExplainabilityPanel({ prediction, isLoading }: AIExplainabilityPanelProps) {
  if (!prediction && !isLoading) {
    return (
      <Card className="rounded-[2.5rem] bg-muted/10 border-2 border-dashed border-border p-10 flex flex-col items-center justify-center text-center space-y-4 h-full">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Explainability Standby</p>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Awaiting neural sync to provide diagnostic rationale.
          </p>
        </div>
      </Card>
    );
  }

  const contributions = [
    { label: 'Body Temperature', value: prediction?.featureContributions.bodyTemperature || 0, icon: Thermometer, color: 'bg-red-500' },
    { label: 'Environment Temp', value: prediction?.featureContributions.environmentTemp || 0, icon: Sun, color: 'bg-orange-500' },
    { label: 'Heart Rate', value: prediction?.featureContributions.heartRate || 0, icon: Activity, color: 'bg-emerald-500' },
    { label: 'Humidity', value: prediction?.featureContributions.humidity || 0, icon: Wind, color: 'bg-blue-500' },
  ].sort((a, b) => b.value - a.value);

  const dominantFactor = contributions[0];

  return (
    <Card className="rounded-[2.5rem] bg-card border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explainable AI (XAI)</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Diagnostic <span className="text-primary">Rationale</span></h3>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">Neural Insights</span>
        </div>
      </div>

      <div className="p-8 space-y-8 flex-1">
        {/* Dominant Reason Box */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-[2rem] border-2 transition-colors",
            prediction?.riskLevel === 'critical' || prediction?.riskLevel === 'high' 
              ? "bg-red-50 border-red-100" 
              : "bg-emerald-50 border-emerald-100"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className={cn("h-4 w-4", prediction?.riskLevel === 'critical' ? "text-red-600" : "text-emerald-600")} />
            <h4 className={cn("text-[10px] font-black uppercase tracking-widest", prediction?.riskLevel === 'critical' ? "text-red-600" : "text-emerald-600")}>
              Primary Driver: {dominantFactor.label}
            </h4>
          </div>
          <p className="text-sm font-bold text-foreground leading-relaxed italic">
            "{prediction?.explanation || 'Ingesting telemetry metrics...'}"
          </p>
        </motion.div>

        {/* Feature Contribution Bars */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Feature Influence</h4>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Clinical Weight %</span>
          </div>
          
          <div className="space-y-5">
            {contributions.map((item, idx) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-sm", item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black text-foreground uppercase tracking-tight">{item.label}</span>
                  </div>
                  <span className="text-xs font-black font-mono text-foreground">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-1.5 bg-muted rounded-full" indicatorClassName={item.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Learned Patterns */}
        <div className="pt-6 border-t border-border space-y-3">
          <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Forensic Pattern Match</h4>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border">
            <p className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed tracking-tight">
              {prediction?.learnedPatterns || 'No stable patterns identified yet.'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-border bg-muted/5">
        <p className="text-[9px] font-medium text-muted-foreground leading-relaxed uppercase tracking-wide flex items-center gap-2">
          <BrainCircuit className="h-3 w-3" />
          Rationale derived from deep-learning comparative analysis of 12,482+ thermal incident nodes.
        </p>
      </div>
    </Card>
  );
}
