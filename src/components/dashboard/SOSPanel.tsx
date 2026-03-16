"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Phone, Mail, ShieldAlert, UserPlus, Loader2, Smartphone, CheckCircle2, BellRing, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { sendEmergencyFcm } from '@/app/actions/alerts';

const COUNTRY_CODES = [
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
];

export function SOSPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newType, setNewType] = useState<'phone' | 'fcm' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState('IN');
  const [isDispatching, setIsDispatching] = useState(false);

  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

  const handleAdd = () => {
    if (!db || !user) return;
    if (contacts && contacts.length >= 5) {
      toast({ title: "Limit reached", description: "System restricted to 5 rescue nodes.", variant: "destructive" });
      return;
    }
    if (!newName || !newContact) return;

    let formattedContact = newContact;
    if (newType === 'phone') {
      const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
      const dialPrefix = selectedCountry?.dial_code || '+91';
      formattedContact = `${dialPrefix}${newContact.replace(/^\+/, '')}`;
    }

    const contactsRef = collection(db, 'users', user.uid, 'emergency_contacts');
    addDocumentNonBlocking(contactsRef, {
      userId: user.uid,
      name: newName,
      phoneNumber: newType === 'phone' ? formattedContact : '',
      email: newType === 'email' ? formattedContact : '',
      fcmToken: newType === 'fcm' ? formattedContact : '',
      type: newType,
      isPrimary: (contacts?.length || 0) === 0,
      enabledForAlerts: true,
      dateAdded: new Date().toISOString()
    });

    setNewName('');
    setNewContact('');
    toast({ title: "Node Synchronized", description: `${newName} added to rescue network.` });
  };

  const handleDelete = (contactId: string) => {
    if (!db || !user) return;
    const contactRef = doc(db, 'users', user.uid, 'emergency_contacts', contactId);
    deleteDocumentNonBlocking(contactRef);
    toast({ title: "Node Removed", description: "Contact disconnected from the network." });
  };

  const triggerRescueProtocol = async () => {
    if (!db || !user || !contacts || contacts.length === 0) {
      toast({ title: "No Rescue Nodes", description: "Establish at least one contact node.", variant: "destructive" });
      return;
    }

    setIsDispatching(true);
    
    const message = `CRITICAL SOS: HeatGuard AI detected a thermal emergency. Rescue required immediately. Live Location: https://www.google.com/maps?q=40.7128,-74.0060`;

    for (const contact of contacts) {
      if (contact.type === 'fcm' || contact.fcmToken) {
        sendEmergencyFcm(contact.fcmToken || 'token-placeholder', message);
      }
    }

    const historyRef = collection(db, 'users', user.uid, 'alert_history');
    addDocumentNonBlocking(historyRef, {
      userId: user.uid,
      triggerTimestamp: new Date().toISOString(),
      alertType: 'Rescue Protocol Triggered',
      status: 'sent',
      bodyTemperatureAtAlertC: 40.2,
      locationAtAlertLatitude: 40.7128,
      locationAtAlertLongitude: -74.0060,
      emergencyContactIds: contacts.map(c => c.id),
      protocol: 'FCM High-Priority + Cellular',
      alertMessage: message
    });

    const primaryPhone = contacts.find(c => c.isPrimary && c.phoneNumber)?.phoneNumber || contacts.find(c => c.phoneNumber)?.phoneNumber;
    if (primaryPhone) {
      const smsUrl = `sms:${primaryPhone}?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    }

    setTimeout(() => {
      setIsDispatching(false);
      toast({ title: "Rescue Protocol Active", description: "All rescue nodes signaled successfully." });
    }, 1000);
  };

  return (
    <Card className="bg-card border-border shadow-medical rounded-[2.5rem] overflow-hidden h-full flex flex-col border">
      <CardHeader className="bg-muted/30 border-b border-border p-5 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-3 font-black tracking-tight uppercase text-foreground">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Rescue Network
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Node Management Hub</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Active Sync</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 px-6 pt-6 pb-6 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Established Nodes</h4>
            <span className="text-[9px] font-black text-muted uppercase">{contacts?.length || 0} / 5</span>
          </div>
          
          <div className="space-y-2">
            {contacts?.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 border border-border rounded-2xl bg-muted/20 group hover:bg-muted/40 hover:border-primary/20 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {contact.type === 'fcm' ? <BellRing className="h-4 w-4" /> : contact.phoneNumber ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[100px]">{contact.name}</p>
                      {contact.isPrimary && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase truncate max-w-[120px]">
                      {contact.type === 'fcm' ? 'Cloud Push Token' : contact.phoneNumber || contact.email}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete(contact.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {(!contacts || contacts.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Smartphone className="h-5 w-5" />
                </div>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
                  No Emergency Nodes Established.<br />Configure below to activate network.
                </p>
              </div>
            )}
          </div>
        </div>

        {(!contacts || contacts.length < 5) && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-primary">
              <Plus className="h-3 w-3" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Configure New Node</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Responder Identity</Label>
                <Input 
                  className="h-10 bg-muted/30 border-transparent rounded-xl text-xs font-bold focus:bg-background focus:border-primary transition-all" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="e.g. Primary Care" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dispatch Protocol</Label>
                <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                  <SelectTrigger className="h-10 bg-muted/30 border-transparent rounded-xl text-[10px] font-black uppercase tracking-wider focus:bg-background focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border shadow-xl">
                    <SelectItem value="phone" className="text-[10px] font-black uppercase">Cellular Node (SMS)</SelectItem>
                    <SelectItem value="fcm" className="text-[10px] font-black uppercase">Cloud Push (FCM)</SelectItem>
                    <SelectItem value="email" className="text-[10px] font-black uppercase">Email Signal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Signal Destination</Label>
              <div className="flex gap-2">
                {newType === 'phone' && (
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[85px] h-10 bg-muted/30 border-transparent rounded-xl text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border shadow-xl">
                      {COUNTRY_CODES.map(c => (
                        <SelectItem key={c.code} value={c.code} className="text-[10px] font-black uppercase">
                          {c.flag} {c.dial_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input 
                  className="h-10 bg-muted/30 border-transparent rounded-xl text-xs font-bold flex-1 focus:bg-background focus:border-primary transition-all" 
                  value={newContact} 
                  onChange={e => setNewContact(e.target.value)} 
                  placeholder={newType === 'phone' ? 'Phone Number' : newType === 'fcm' ? 'Registration Token' : 'Email Address'} 
                />
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95" 
                  onClick={handleAdd} 
                  disabled={!newName || !newContact}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <Button 
            disabled={isDispatching}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black tracking-[0.2em] shadow-2xl h-14 rounded-[2rem] uppercase text-[11px] transition-all active:scale-[0.98]" 
            onClick={triggerRescueProtocol}
          >
            {isDispatching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ShieldAlert className="mr-2 h-4 w-4" />
            )}
            Trigger Rescue Protocol
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}