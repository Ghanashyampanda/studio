
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History as AuditIcon, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  Activity, 
  MapPin, 
  Thermometer,
  Zap,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Query for Incident Audit (Alerts)
  const alertsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'alert_history'), orderBy('triggerTimestamp', 'desc'), limit(50));
  }, [db, user]);
  const { data: alerts } = useCollection(alertsQuery);

  // Query for Telemetry Log (Vitals)
  const vitalsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'vital_sign_data'), orderBy('timestamp', 'desc'), limit(100));
  }, [db, user]);
  const { data: vitals } = useCollection(vitalsQuery);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-none text-[9px] uppercase"><CheckCircle2 className="h-3 w-3 mr-1" /> Sent</Badge>;
      case 'failed': return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-none text-[9px] uppercase"><AlertTriangle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground border-none text-[9px] uppercase"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
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
      <main className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
            <AuditIcon className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Clinical Data Archives</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Data <span className="text-primary">History</span></h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Chronological records of biometric telemetry and incident reports.</p>
        </div>

        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8">
            <TabsTrigger value="vitals" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-medical">
              <Activity className="h-3.5 w-3.5 mr-2" /> Telemetry Log
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-medical">
              <ShieldAlert className="h-3.5 w-3.5 mr-2" /> Incident Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vitals">
            <div className="bg-card rounded-[2rem] md:rounded-[3rem] border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border">
                      <TableHead className="py-6 px-8 text-[10px] font-black uppercase text-muted-foreground">Time</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground">Body Temp</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground">Heart Rate</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground">Env Temp</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground">Pulse Freq</TableHead>
                      <TableHead className="py-6 px-8 text-right text-[10px] font-black uppercase text-muted-foreground">GPS Lock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vitals?.length ? vitals.map((record) => (
                      <TableRow key={record.id} className="border-border hover:bg-muted transition-colors">
                        <TableCell className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-foreground">{format(new Date(record.timestamp), 'HH:mm:ss')}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{format(new Date(record.timestamp), 'MMM dd')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2 text-primary">
                            <Thermometer className="h-3.5 w-3.5" />
                            <span className="text-xs font-black">{(record.bodyTemperatureC || 0).toFixed(1)}°C</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2">
                            <Heart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-bold">{(record.heartRateBPM || record.heartRateBpm || 0)} BPM</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className="text-xs font-bold text-muted-foreground">{(record.outsideTemperatureC || 0).toFixed(1)}°C</span>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-secondary" />
                            <span className="text-xs font-bold">{(record.pulseFrequencyBPM || record.pulseFrequencyBpm || record.heartRateBPM || record.heartRateBpm || 0)} BPM</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <div className="flex items-center justify-end gap-2 text-[10px] font-mono font-black text-primary/80 uppercase">
                            <MapPin className="h-3 w-3" />
                            {(record.latitude || 0).toFixed(4)}, {(record.longitude || 0).toFixed(4)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-32 text-center text-muted-foreground font-black uppercase tracking-widest text-sm">No telemetry archived</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="bg-card rounded-[2rem] md:rounded-[3rem] border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[700px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border">
                      <TableHead className="py-6 px-8 text-[10px] font-black uppercase text-muted-foreground">Date & Time</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground">Trigger Event</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground">Temp (°C)</TableHead>
                      <TableHead className="py-6 text-[10px] font-black uppercase text-muted-foreground">Status</TableHead>
                      <TableHead className="py-6 px-8 text-right text-[10px] font-black uppercase text-muted-foreground">Contacts Notified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts?.length ? alerts.map((alert) => (
                      <TableRow key={alert.id} className="border-border hover:bg-muted transition-colors">
                        <TableCell className="py-6 px-8">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-foreground">{format(new Date(alert.triggerTimestamp), 'MMM dd, yyyy')}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{format(new Date(alert.triggerTimestamp), 'HH:mm:ss')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold uppercase text-muted-foreground">{alert.alertType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className="text-xs font-black text-destructive">{(alert.bodyTemperatureAtAlertC || 0).toFixed(1)}°C</span>
                        </TableCell>
                        <TableCell className="py-6">{getStatusBadge(alert.status)}</TableCell>
                        <TableCell className="py-6 px-8 text-right text-[10px] font-bold text-muted-foreground">
                          {alert.emergencyContactIds?.length || 0} Nodes
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-32 text-center text-muted-foreground font-black uppercase tracking-widest text-sm">No incidents archived</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
