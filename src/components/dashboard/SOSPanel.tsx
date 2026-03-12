"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Phone, Mail, ShieldAlert, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function SOSPanel() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newType, setNewType] = useState<'phone' | 'email'>('phone');

  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergencyContacts');
  }, [db, user]);
  const { data: contacts } = useCollection(contactsQuery);

  const handleAdd = () => {
    if (!db || !user) return;
    if (contacts && contacts.length >= 3) {
      toast({ title: "Limit reached", description: "System restricted to 3 emergency nodes.", variant: "destructive" });
      return;
    }
    if (!newName || !newContact) return;

    const contactsRef = collection(db, 'users', user.uid, 'emergencyContacts');
    addDocumentNonBlocking(contactsRef, {
      userId: user.uid,
      name: newName,
      phoneNumber: newType === 'phone' ? newContact : '',
      email: newType === 'email' ? newContact : '',
      isPrimary: (contacts?.length || 0) === 0,
      enabledForAlerts: true,
      dateAdded: new Date().toISOString()
    });

    setNewName('');
    setNewContact('');
    toast({ title: "Node synchronized", description: `${newName} added to network.` });
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
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Protocol</Label>
                <div className="flex gap-2">
                  <Button variant={newType === 'phone' ? 'secondary' : 'outline'} size="sm" className="h-11 flex-1 text-[10px] font-bold rounded-xl" onClick={() => setNewType('phone')}>SMS</Button>
                  <Button variant={newType === 'email' ? 'secondary' : 'outline'} size="sm" className="h-11 flex-1 text-[10px] font-bold rounded-xl" onClick={() => setNewType('email')}>EMAIL</Button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address</Label>
              <div className="flex gap-2">
                <Input className="h-11 bg-muted/30 border-border rounded-xl text-sm" value={newContact} onChange={e => setNewContact(e.target.value)} placeholder={newType === 'phone' ? '+1...' : 'email@...'} />
                <Button size="icon" className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/10" onClick={handleAdd} disabled={!newName || !newContact}>
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold tracking-widest shadow-xl shadow-secondary/10 h-14 rounded-2xl uppercase text-xs" onClick={() => toast({ title: "SOS ACTIVATED", variant: "destructive" })}>
          Trigger Manual SOS
        </Button>
      </CardFooter>
    </Card>
  );
}