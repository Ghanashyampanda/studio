
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, History as AuditIcon, Thermometer, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function AlertHistoryPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const alertsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'alert_history'), orderBy('triggerTimestamp', 'desc'));
  }, [db, user]);
  const { data: alerts, isLoading: isAlertsLoading } = useCollection(alertsQuery);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return <Badge className="bg-emerald-100 text-emerald-600 border-none text-[9px] uppercase"><CheckCircle2 className="h-3 w-3 mr-1" /> Sent</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-600 border-none text-[9px] uppercase"><AlertTriangle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] uppercase"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 font-body">
      <main className="max-w-6xl mx-auto px-6 space-y-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <AuditIcon className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Incident Forensic Audit</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Alert <span className="text-primary">History</span></h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Chronological record of automated thermal defense triggers.</p>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="py-6 px-8 text-[10px] font-black uppercase text-slate-400">Date & Time</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Trigger Event</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Temp (°C)</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase text-slate-400">Status</TableHead>
                <TableHead className="py-6 px-8 text-right text-[10px] font-black uppercase text-slate-400">Contacts Notified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts?.length ? alerts.map((alert) => (
                <TableRow key={alert.id} className="border-slate-50 hover:bg-slate-50 transition-colors">
                  <TableCell className="py-6 px-8">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900">{format(new Date(alert.triggerTimestamp), 'MMM dd, yyyy')}</span>
                      <span className="text-[10px] font-bold text-slate-400">{format(new Date(alert.triggerTimestamp), 'HH:mm:ss')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold uppercase text-slate-600">{alert.alertType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="text-xs font-black text-red-500">{alert.bodyTemperatureAtAlertC?.toFixed(1)}°C</span>
                  </TableCell>
                  <TableCell className="py-6">{getStatusBadge(alert.status)}</TableCell>
                  <TableCell className="py-6 px-8 text-right text-[10px] font-bold text-slate-400">
                    {alert.emergencyContactIds?.length || 0} Nodes
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center text-slate-300 font-black uppercase tracking-widest text-sm">No incidents archived</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
