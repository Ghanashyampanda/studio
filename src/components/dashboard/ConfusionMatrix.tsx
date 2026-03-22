
"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Target, AlertTriangle, ShieldCheck, Zap, Info } from 'lucide-react';

interface ConfusionMatrixProps {
  matrix: {
    safe: { safe: number; warning: number; critical: number };
    warning: { safe: number; warning: number; critical: number };
    critical: { safe: number; warning: number; critical: number };
  };
}

export function ConfusionMatrix({ matrix }: ConfusionMatrixProps) {
  const classes = ['safe', 'warning', 'critical'] as const;
  
  const stats = useMemo(() => {
    let tp = 0;
    let total = 0;
    
    classes.forEach(c => {
      tp += matrix[c][c];
      classes.forEach(p => {
        total += matrix[c][p];
      });
    });

    const accuracy = total > 0 ? (tp / total) * 100 : 0;
    
    // Simple Precision/Recall for 'Critical' class as primary safety metric
    const criticalTP = matrix.critical.critical;
    const criticalFP = matrix.safe.critical + matrix.warning.critical;
    const criticalFN = matrix.critical.safe + matrix.critical.warning;
    
    const precision = (criticalTP + criticalFP) > 0 ? (criticalTP / (criticalTP + criticalFP)) * 100 : 0;
    const recall = (criticalTP + criticalFN) > 0 ? (criticalTP / (criticalTP + criticalFN)) * 100 : 0;

    return { accuracy, precision, recall, total };
  }, [matrix]);

  const getCellColor = (val: number, isDiagonal: boolean) => {
    if (val === 0) return 'bg-muted/20 opacity-30';
    if (isDiagonal) {
      if (val > 30) return 'bg-primary text-primary-foreground';
      if (val > 15) return 'bg-primary/70 text-primary-foreground';
      return 'bg-primary/30 text-primary';
    }
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <div className="bg-card border rounded-[2.5rem] shadow-sm overflow-hidden border-border h-full flex flex-col">
      <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Forensic Evaluation</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Confusion <span className="text-primary">Matrix</span></h3>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Model Precision</p>
          <p className="text-xl font-black text-primary tracking-tighter">{stats.precision.toFixed(1)}%</p>
        </div>
      </div>

      <div className="p-8 space-y-8 flex-1">
        <div className="relative mt-8 ml-8">
          {/* Y-Axis Label */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
            Actual State
          </div>
          
          {/* X-Axis Label */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Predicted State
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Headers */}
            <div />
            {classes.map(c => (
              <div key={c} className="text-center text-[8px] font-black uppercase text-muted-foreground py-2">{c}</div>
            ))}

            {/* Matrix Rows */}
            {classes.map(actual => (
              <>
                <div key={`${actual}-label`} className="flex items-center justify-end pr-4 text-[8px] font-black uppercase text-muted-foreground">{actual}</div>
                {classes.map(predicted => (
                  <motion.div 
                    key={`${actual}-${predicted}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center shadow-sm border border-border/50",
                      getCellColor(matrix[actual][predicted], actual === predicted)
                    )}
                  >
                    <span className="text-lg font-black tracking-tighter">{matrix[actual][predicted]}</span>
                    <span className="text-[7px] font-bold uppercase opacity-60">Cases</span>
                  </motion.div>
                ))}
              </>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <MetricBlock label="Accuracy" value={`${stats.accuracy.toFixed(1)}%`} icon={ShieldCheck} color="text-emerald-500" />
          <MetricBlock label="Precision" value={`${stats.precision.toFixed(1)}%`} icon={Target} color="text-primary" />
          <MetricBlock label="Recall" value={`${stats.recall.toFixed(1)}%`} icon={Zap} color="text-orange-500" />
        </div>
      </div>

      <div className="px-8 py-6 border-t border-border bg-muted/5 flex items-center gap-3">
        <Info className="h-4 w-4 text-muted-foreground" />
        <p className="text-[9px] font-medium text-muted-foreground leading-relaxed uppercase tracking-wide">
          Evaluated against {stats.total} forensic telemetry nodes. Matrix reflects critical incident reliability.
        </p>
      </div>
    </div>
  );
}

function MetricBlock({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3 w-3", color)} />
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-black text-foreground tracking-tight">{value}</p>
    </div>
  );
}
