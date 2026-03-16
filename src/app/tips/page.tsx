"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { generateHealthTips, type HealthTipsOutput } from '@/ai/flows/health-tips-flow';
import { 
  Sparkles, 
  Droplets, 
  Sun, 
  Wind, 
  Shirt, 
  Activity, 
  AlertCircle, 
  Lightbulb, 
  RefreshCw,
  Heart,
  GlassWater,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';

export default function HealthTipsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [tips, setTips] = useState<HealthTipsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const vitalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'vital_sign_data'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
  }, [db, user]);
  const { data: vitalsData } = useCollection(vitalsQuery);

  const latestVitals = vitalsData?.[0] || {
    bodyTemperatureC: 37.0,
    outsideTemperatureC: 32.0,
    humidityPercentage: 45,
    activityLevel: 'light'
  };

  const fetchTips = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await generateHealthTips({
        bodyTemperatureC: latestVitals.bodyTemperatureC,
        outsideTemperatureC: latestVitals.outsideTemperatureC,
        humidityPercentage: latestVitals.humidityPercentage,
        activityLevel: latestVitals.activityLevel,
      });
      setTips(result);
    } catch (err) {
      console.error("Failed to fetch AI tips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isUserLoading) {
      fetchTips();
    }
  }, [user, isUserLoading, latestVitals.bodyTemperatureC]);

  const getIcon = (name: string) => {
    // @ts-ignore
    const IconComponent = LucideIcons[name] || Lightbulb;
    return <IconComponent className="h-6 w-6" />;
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 font-body">
      <main className="max-w-6xl mx-auto px-6 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5 fill-primary/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personalized Intelligence</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
              Health <span className="text-primary">& Safety Tips</span>
            </h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest max-w-lg">
              AI-generated recommendations tailored to your current physiological state.
            </p>
          </div>
          <Button 
            onClick={fetchTips} 
            disabled={loading}
            variant="outline"
            className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>

        {/* AI Summary Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary p-8 rounded-[3rem] text-primary-foreground shadow-2xl shadow-primary/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Heart className="h-8 w-8 fill-white" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-black uppercase tracking-tight">System Summary</h2>
            <p className="text-sm font-medium text-white/80 leading-relaxed uppercase tracking-widest">
              {loading ? "Analyzing telemetry data..." : tips?.summary || "Maintaining optimal thermal stability. Continue monitoring."}
            </p>
          </div>
        </motion.div>

        {/* Urgent Warnings */}
        {tips?.urgentNotice && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-3xl bg-destructive/5 border-2 border-destructive/20 flex items-center gap-4 text-destructive"
          >
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{tips.urgentNotice}</p>
          </motion.div>
        )}

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-[2.5rem] p-8 space-y-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))
          ) : (
            tips?.categories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="h-full"
              >
                <Card className="h-full hover:border-primary/20 transition-all rounded-[2.5rem] p-8 shadow-sm group">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    {getIcon(category.icon)}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4">{category.title}</h3>
                  <ul className="space-y-4">
                    {category.tips.map((tip, tIdx) => (
                      <li key={tIdx} className="flex gap-3 text-xs font-bold text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Static Prevention Guide */}
        <section className="space-y-8 pt-12 border-t border-border">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Sunstroke <span className="text-primary">Prevention Guide</span></h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Essential protocols for extreme environments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 dark:bg-card rounded-[3rem] p-10 text-white dark:text-foreground border dark:border-border space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                <GlassWater className="h-3 w-3" /> Hydration Protocol
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">The 20-Minute Rule</h3>
              <p className="text-sm text-slate-400 dark:text-muted-foreground font-medium leading-relaxed">
                Drink 250ml of water every 20 minutes of moderate activity in heat, even if you don't feel thirsty. Thirst is a late indicator of dehydration.
              </p>
              <ul className="space-y-3">
                {["Monitor urine color (pale straw is ideal)", "Avoid caffeine and alcohol", "Use electrolyte replacement for intense tasks"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border-2 border-border rounded-[3rem] p-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" /> Defense Protocol
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Clothing & Protection</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Wear light-colored, loose-fitting, breathable clothing. Natural fibers like cotton or high-performance moisture-wicking synthetics are recommended.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-2xl border border-border">
                  <Shirt className="h-5 w-5 text-primary mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-tight text-foreground">Breathable Fabrics</p>
                </div>
                <div className="p-4 bg-muted rounded-2xl border border-border">
                  <Sun className="h-5 w-5 text-secondary mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-tight text-foreground">UV Protection</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <div className="bg-muted/50 p-10 rounded-[3rem] border border-border flex flex-col md:flex-row items-center gap-10">
          <div className="h-20 w-20 rounded-full bg-background shadow-sm flex items-center justify-center text-primary shrink-0">
            <Stethoscope className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black uppercase tracking-tight text-foreground">Medical Disclaimer</h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-widest">
              AI health tips are for informational purposes only and do not replace professional medical advice. If you suspect heat stroke, seek emergency medical care immediately by dialing emergency services.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
