"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Phone, Mail, ShieldAlert, UserPlus, Send, Loader2, Smartphone, ExternalLink, CheckCircle2, BellRing, Info, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { sendEmergencyFcm } from '@/app/actions/alerts';
import { getToken, onMessage } from 'firebase/messaging';
import { initializeFirebase } from '@/firebase';

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
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

  // Sync FCM Token for the current device
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const setupFCM = async () => {
      try {
        const { messaging } = initializeFirebase();
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BNoC0vX6Qz_8mK6Z6X6X6X6X6X6X6X6X6X6X6X6X6X6X' // Placeholder VAPID key
          });
          setFcmToken(token);
        }
      } catch (err) {
        console.warn("FCM registration deferred: Platform restriction or missing manifest.");
      }
    };

    setupFCM();
  }, []);

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

  const handleManualSOS = async () => {
    if (!db || !user || !contacts || contacts.length === 0) {
      toast({ title: "No Rescue Nodes", description: "Establish at least one contact node.", variant: "destructive" });
      return;
    }

    setIsDispatching(true);
    
    const emergencyMessage = `CRITICAL SOS: HeatGuard AI detected a thermal emergency. Rescue required immediately. Location: https://www.google.com/maps?q=40.7128,-74.0060`;

    // 1. Dispatch Cloud Protocols (FCM & History Logging)
    for (const contact of contacts) {
      if (contact.type === 'fcm' || contact.fcmToken) {
        await sendEmergencyFcm(contact.fcmToken || 'token-placeholder', emergencyMessage);
      }
    }

    // 2. Log incident to forensic audit
    const historyRef = collection(db, 'users', user.uid, 'alert_history');
    addDocumentNonBlocking(historyRef, {
      userId: user.uid,
      triggerTimestamp: new Date().toISOString(),
      alertType: 'Manual Protocol Trigger',
      status: 'sent',
      bodyTemperatureAtAlertC: 37.0,
      locationAtAlertLatitude: 40.7128,
      locationAtAlertLongitude: -74.0060,
      emergencyContactIds: contacts.map(c => c.id),
      alertMessage: emergencyMessage
    });

    // 3. Automated Native Dispatch for Primary Phone Node
    const primaryPhone = contacts.find(c => c.isPrimary && c.phoneNumber)?.phoneNumber || contacts.find(c => c.phoneNumber)?.phoneNumber;
    
    if (primaryPhone) {
      toast({ title: "Cloud Node Synced", description: "FCM broadcast complete. Handing off to cellular node." });
      setTimeout(() => {
        const smsUrl = `sms:${primaryPhone}?body=${encodeURIComponent(emergencyMessage)}`;
        window.location.href = smsUrl;
        setIsDispatching(false);
      }, 1000);
    } else {
      setIsDispatching(false);
      toast({ title: "Protocol Complete", description: "FCM nodes signaled. No phone node detected for SMS." });
    }
  };

  return (
    <Card className="bg-white border-border shadow-sm rounded-3xl overflow-hidden h-full">
      <CardHeader className="bg-muted/30 border-b border-border p-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-3 font-bold tracking-tight uppercase text-foreground">
          <ShieldAlert className="h-5 w-5 text-secondary" />
          Rescue Network
        </CardTitle>
        <div className="flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Protocol Active</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          {contacts?.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/30 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {contact.type === 'fcm' ? <BellRing className="h-5 w-5" /> : contact.phoneNumber ? <Phone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <div className="max-w-[150px]">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{contact.name}</p>
                    {contact.isPrimary && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase truncate">
                    {contact.type === 'fcm' ? 'Cloud Push Node' : contact.phoneNumber || contact.email}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(contact.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!contacts || contacts.length === 0) && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
              <Smartphone className="h-10 w-10 text-muted-foreground opacity-30" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No Rescue Nodes Synced</p>
            </div>
          )}
        </div>

        {(!contacts || contacts.length < 5) && (
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity</Label>
                <Input className="h-11 bg-muted/30 border-border rounded-xl text-sm" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Responder Name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Protocol</Label>
                <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                  <SelectTrigger className="h-11 bg-muted/30 border-border rounded-xl text-[10px] font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">PHONE NODE</SelectItem>
                    <SelectItem value="fcm">CLOUD PUSH (FCM)</SelectItem>
                    <SelectItem value="email">EMAIL NODE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Detail</Label>
              <div className="flex gap-2">
                {newType === 'phone' && (
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[80px] h-11 bg-muted/30 border-border rounded-xl text-[10px] font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <Input 
                  className="h-11 bg-muted/30 border-border rounded-xl text-sm flex-1" 
                  value={newContact} 
                  onChange={e => setNewContact(e.target.value)} 
                  placeholder={newType === 'phone' ? 'Number' : newType === 'fcm' ? 'FCM Device Token' : 'Email Address'} 
                />
                <Button size="icon" className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!newName || !newContact}>
                  <UserPlus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          disabled={isDispatching} 
          className="w-full bg-destructive hover:bg-destructive/90 text-white font-black tracking-widest shadow-2xl h-16 rounded-[2rem] uppercase text-xs" 
          onClick={handleManualSOS}
        >
          {isDispatching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldAlert className="mr-2 h-5 w-5" />}
          Trigger Rescue Protocol
        </Button>
      </CardFooter>
    </Card>
  );
}
