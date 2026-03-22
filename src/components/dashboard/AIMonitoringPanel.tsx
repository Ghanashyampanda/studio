
"use client";

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  RefreshCcw, 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AIMonitoringPanelProps {
  prediction: string;
  totalRecords: number;
}

export function AIMonitoringPanel({ prediction, totalRecords }: AIMonitoringPanelProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [isRetraining, setIsRetraining] = useState(false);

  const metricsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'ai_metrics', 'current');
  }, [db, user]);
  const { data: metrics } = useDoc(metricsRef);

  const handleRetrain = async () => {
    if (!db || !user) return;
    setIsRetraining(true);

    // Simulate training delay
    setTimeout(() => {
      const newAccuracy = Math.min(99.8, (metrics?.currentAccuracy || 85) + (Math.random() * 2));
      const now = new Date().toISOString();

      // Update current metrics
      setDocumentNonBlocking(metricsRef!, {
        lastTrained: now,
        datasetSize: totalRecords,
        currentAccuracy: newAccuracy,
        modelStatus: 'Ready'
      }, { merge: true });

      // Add to history for the chart
      const historyRef = collection(db, 'users', user.uid, 'ai_accuracy_history');
      addDocumentNonBlocking(historyRef, {
        accuracy: parseFloat(newAccuracy.toFixed(1)),
        timestamp: now
      });

      setIsRetraining(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-100';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'safe': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-primary bg-primary/5 border-primary/10';
    }
  };

  return (
    <Card className="rounded-[2.5rem] bg-card border-none shadow-sm border p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
            <Brain className="h-6 w-6" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-primary/20 rounded-2xl -z-10"
            />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">Neural Hub</h3>
            <p className="text-xl font-black uppercase text-foreground">AI Intelligence</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border-2", getStatusColor(prediction))}>
          Prediction: {prediction || 'Analyzing'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Engine Status
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", isRetraining ? "bg-orange-500 animate-pulse" : "bg-emerald-500")} />
            <p className="text-sm font-black uppercase text-foreground">{isRetraining ? 'Training...' : (metrics?.modelStatus || 'Ready')}</p>
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Database className="h-3.5 w-3.5" /> Knowledge Base
          </div>
          <p className="text-sm font-black uppercase text-foreground">{totalRecords} Records</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">
          <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> Last Neural Sync</span>
          <span className="text-foreground">
            {metrics?.lastTrained ? format(new Date(metrics.lastTrained), 'MMM dd, HH:mm') : 'None'}
          </span>
        </div>
        
        <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Model Accuracy</span>
            <span className="text-sm font-black text-primary">{(metrics?.currentAccuracy || 85).toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metrics?.currentAccuracy || 85}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button 
          onClick={handleRetrain}
          disabled={isRetraining}
          className="w-full h-14 rounded-2xl bg-white border-2 border-primary/20 text-primary hover:bg-primary hover:text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-sm transition-all"
        >
          {isRetraining ? (
            <Loader2 className="h-4 w-4 animate-spin mr-3" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-3" />
          )}
          {isRetraining ? 'Retraining Protocol...' : 'Retrain Neural Model'}
        </Button>
      </div>
    </Card>
  );
}

import { motion } from 'framer-motion';
