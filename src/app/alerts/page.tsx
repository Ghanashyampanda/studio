
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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Search, 
  Filter, 
  AlertTriangle, 
  Thermometer, 
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function AlertHistoryPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch Alerts History
  const alertsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'alert_history'),
      orderBy('triggerTimestamp', 'desc')
    );
  }, [db, user]);
  
  const { data: alerts, isLoading: isAlertsLoading } = useCollection(alertsQuery);

  // Filtered Data
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    return alerts.filter(alert => {
      const matchesSearch = 
        alert.alertType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.messageContent?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [alerts, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-100 text-emerald-600 border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest"><CheckCircle2 className="h-3 w-3 mr-1.5" /> Resolved</Badge>;
      case 'cancelled':
        return <Badge className="bg-slate-100 text-slate-500 border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest"><XCircle className="h-3 w-3 mr-1.5" /> Cancelled</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/10 text-destructive border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest"><AlertCircle className="h-3 w-3 mr-1.5" /> Escalated</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-600 border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest"><Clock className="h-3 w-3 mr-1.5" /> Pending</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    if (type?.toLowerCase().includes('hyperthermia') || type?.toLowerCase().includes('critical')) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    return <ShieldAlert className="h-4 w-4 text-primary" />;
  };

  if (isUserLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 font-body">
      <main className="max-w-7xl mx-auto px-6 space-y-10">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Forensic Audit</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
            Alert <span className="text-primary">History</span>
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
            Chronological record of automated thermal defense triggers.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by incident type or message..." 
              className="pl-11 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="pl-11 h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all text-sm font-bold">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Resolved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="failed">Escalated</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date / Time</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Incident Type</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Temp</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status Protocol</TableHead>
                <TableHead className="text-right py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAlertsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={5} className="py-8 px-8">
                      <div className="h-4 bg-slate-100 rounded-full w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-slate-50 transition-colors border-slate-50 group">
                    <TableCell className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">
                          {format(new Date(alert.triggerTimestamp), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          {format(new Date(alert.triggerTimestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight text-slate-700">
                          {alert.alertType || 'General Alert'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                      <span className="text-xs font-black text-destructive">
                        {alert.bodyTemperatureAtAlertC ? `${alert.bodyTemperatureAtAlertC.toFixed(1)}°C` : '--'}
                      </span>
                    </TableCell>
                    <TableCell className="py-6">
                      {getStatusBadge(alert.status)}
                    </TableCell>
                    <TableCell className="py-6 px-8 text-right">
                      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full hover:bg-primary/5 hover:text-primary transition-all">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center space-y-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <History className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Records Detected</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase">Alert audit trail is currently empty.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* System Summary Info */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter">
              Archive <span className="text-primary">Integrity</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md uppercase tracking-widest">
              Incident reports are cryptographically signed and archived for medical review. Data retention is set to 24 months per protocol.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter text-primary leading-none">{filteredAlerts.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Incidents</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black tracking-tighter text-emerald-500 leading-none">
                {alerts?.filter(a => a.status === 'sent').length || 0}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Resolved Nodes</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
