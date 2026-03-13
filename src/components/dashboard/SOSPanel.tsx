
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Phone, Mail, ShieldAlert, UserPlus, Send, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { sendEmergencySms } from '@/app/actions/sms';

const COUNTRY_CODES = [
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
];

export function SOSPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newType, setNewType] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState('US');
  const [isDispatching, setIsDispatching] = useState(false);

  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

  const handleAdd = () => {
    if (!db || !user) return;
    if (contacts && contacts.length >= 3) {
      toast({ title: "Limit reached", description: "System restricted to 3 emergency nodes.", variant: "destructive" });
      return;
    }
    if (!newName || !newContact) return;

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
    const dialPrefix = selectedCountry?.dial_code || '+1';
    const formattedContact = newType === 'phone' ? `${dialPrefix}${newContact.replace(/^\+/, '')}` : newContact;

    const contactsRef = collection(db, 'users', user.uid, 'emergency_contacts');
    addDocumentNonBlocking(contactsRef, {
      userId: user.uid,
      name: newName,
      phoneNumber: newType === 'phone' ? formattedContact : '',
      email: newType === 'email' ? formattedContact : '',
      isPrimary: (contacts?.length || 0) === 0,
      enabledForAlerts: true,
      dateAdded: new Date().toISOString()
    });

    setNewName('');
    setNewContact('');
    toast({ title: "Node synchronized", description: `${newName} added to rescue network.` });
  };

  const handleDelete = (contactId: string) => {
    if (!db || !user) return;
    const contactRef = doc(db, 'users', user.uid, 'emergency_contacts', contactId);
    deleteDocumentNonBlocking(contactRef);
    toast({ title: "Node Removed", description: "Contact disconnected from the network." });
  };

  const handleManualSOS = async () => {
    if (!db || !user) return;
    
    const phoneNodes = contacts?.filter(c => c.phoneNumber) || [];
    if (phoneNodes.length === 0) {
      toast({ 
        title: "No Phone Nodes", 
        description: "Please establish at least one phone node for Twilio dispatch.", 
        variant: "destructive" 
      });
      return;
    }

    setIsDispatching(true);
    const primaryNode = phoneNodes.find(c => c.isPrimary) || phoneNodes[0];
    const emergencyMessage = `CRITICAL TRIPLE-REDUNDANCY SOS: HeatGuard AI detected a thermal emergency. I need immediate assistance. Current Location: https://www.google.com/maps?q=40.7128,-74.0060`;

    // Triple-Redundancy Burst (3 times)
    for (let i = 1; i <= 3; i++) {
      const result = await sendEmergencySms(primaryNode.phoneNumber, `[BURST ${i}/3] ${emergencyMessage}`);
      
      if (result.success) {
        if (result.simulated) {
          toast({
            title: `SIMULATED BURST ${i}/3 SENT`,
            description: `Twilio simulated for ${primaryNode.phoneNumber}. See action logs for details.`,
          });
        } else {
          toast({
            title: `SOS BURST ${i}/3 SENT`,
            description: `Live Twilio dispatch to ${primaryNode.name} successful.`,
          });
        }

        const historyRef = collection(db, 'users', user.uid, 'alert_history');
        addDocumentNonBlocking(historyRef, {
          userId: user.uid,
          triggerTimestamp: new Date().toISOString(),
          alertType: `Manual SOS (Twilio Burst ${i}/3)`,
          status: 'sent',
          bodyTemperatureAtAlertC: 37.0, 
          locationAtAlertLatitude: 40.7128, 
          locationAtAlertLongitude: -74.0060,
          alertMessage: emergencyMessage,
          emergencyContactIds: [primaryNode.id],
          protocol: result.simulated ? 'Twilio Simulation' : 'Twilio Cloud Dispatch'
        });
      } else {
        toast({
          variant: "destructive",
          title: `Dispatch Burst ${i} Failed`,
          description: result.error || "Twilio communication error."
        });
        break; // Stop bursts if one actually fails hard
      }
      
      // Short delay between bursts
      if (i < 3) await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsDispatching(false);
  };

  return (
    <Card className="bg-white border-border shadow-sm rounded-3xl overflow-hidden h-full">
      <CardHeader className="bg-muted/30 border-b border-border p-6">
        <CardTitle className="text-lg flex items-center gap-3 font-bold tracking-tight uppercase text-foreground">
          <ShieldAlert className="h-5 w-5 text-secondary" />
          SOS Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          {contacts?.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/30 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {contact.phoneNumber ? <Phone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{contact.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{contact.phoneNumber || contact.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => handleDelete(contact.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!contacts || contacts.length === 0) && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
              <UserPlus className="h-10 w-10 text-muted-foreground opacity-30" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Network Offline</p>
            </div>
          )}
        </div>

        {(!contacts || contacts.length < 3) && (
          <div className="space-y-4 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity</Label>
                <Input className="h-11 bg-muted/30 border-border rounded-xl text-sm" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Channel</Label>
                <div className="flex gap-2">
                  <Button variant={newType === 'phone' ? 'secondary' : 'outline'} size="sm" className="h-11 flex-1 text-[10px] font-bold rounded-xl" onClick={() => setNewType('phone')}>PHONE</Button>
                  <Button variant={newType === 'email' ? 'secondary' : 'outline'} size="sm" className="h-11 flex-1 text-[10px] font-bold rounded-xl" onClick={() => setNewType('email')}>EMAIL</Button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Detail</Label>
              <div className="flex gap-2">
                {newType === 'phone' && (
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[110px] h-11 bg-muted/30 border-border rounded-xl text-[10px] font-bold">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-1.5">
                            <span>{c.flag}</span>
                            <span>{c.dial_code}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Input 
                  className="h-11 bg-muted/30 border-border rounded-xl text-sm flex-1" 
                  value={newContact} 
                  onChange={e => setNewContact(e.target.value)} 
                  placeholder={newType === 'phone' ? 'Phone Number' : 'Email Address'} 
                />
                <Button size="icon" className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/10" onClick={handleAdd} disabled={!newName || !newContact}>
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 flex flex-col gap-3">
        <Button 
          disabled={isDispatching}
          className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold tracking-widest shadow-xl shadow-secondary/10 h-14 rounded-2xl uppercase text-[10px]" 
          onClick={handleManualSOS}
        >
          {isDispatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Trigger Triple-Redundancy SOS
        </Button>
        <div className="flex items-center gap-2 text-[8px] font-black uppercase text-muted-foreground tracking-widest bg-muted/20 p-3 rounded-xl border border-dashed">
          <Info className="h-3 w-3" />
          Prototyping Mode: SMS dispatches are simulated if Twilio keys are missing.
        </div>
      </CardFooter>
    </Card>
  );
}
