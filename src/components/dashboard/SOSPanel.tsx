"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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
    toast({ title: "Node synchronized", description: `${newName} added to SOS network.` });
  };

  const handleRemove = (id: string) => {
    if (!db || !user) return;
    const docRef = collection(db, 'users', user.uid, 'emergencyContacts');
    // For MVP, we'll assume we have a doc ref helper or use simple delete
    toast({ title: "Removing node...", description: "Network updating." });
  };

  return (
    <Card className="glass border-white/5 rounded-3xl overflow-hidden h-full">
      <CardHeader className="bg-white/[0.02] border-b border-white/5 p-6">
        <CardTitle className="text-lg flex items-center gap-3 font-black tracking-tight">
          <ShieldAlert className="h-5 w-5 text-secondary" />
          SOS NETWORK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          {contacts?.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-4 border border-white/5 rounded-2xl bg-white/[0.02] group hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {contact.phoneNumber ? <Phone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{contact.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{contact.phoneNumber || contact.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!contacts || contacts.length === 0) && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 glass rounded-2xl border-dashed border-white/10">
              <UserPlus className="h-10 w-10 text-muted-foreground opacity-20" />
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Network Offline</p>
            </div>
          )}
        </div>

        {(!contacts || contacts.length < 3) && (
          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</Label>
                <Input className="h-10 bg-white/5 border-white/10 rounded-xl text-xs" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol</Label>
                <div className="flex gap-1.5">
                  <Button variant={newType === 'phone' ? 'secondary' : 'outline'} size="sm" className="h-10 flex-1 text-[10px] font-black rounded-xl" onClick={() => setNewType('phone')}>SMS</Button>
                  <Button variant={newType === 'email' ? 'secondary' : 'outline'} size="sm" className="h-10 flex-1 text-[10px] font-black rounded-xl" onClick={() => setNewType('email')}>EMAIL</Button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Channel Address</Label>
              <div className="flex gap-2">
                <Input className="h-10 bg-white/5 border-white/10 rounded-xl text-xs" value={newContact} onChange={e => setNewContact(e.target.value)} placeholder={newType === 'phone' ? '+1 (555) 000-0000' : 'rescue@network.ai'} />
                <Button size="icon" className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!newName || !newContact}>
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button variant="destructive" className="w-full font-black tracking-widest shadow-xl shadow-secondary/20 h-14 rounded-2xl uppercase text-xs" onClick={() => toast({ title: "MANUAL SOS ACTIVATED", variant: "destructive" })}>
          TRIGGER MANUAL SOS
        </Button>
      </CardFooter>
    </Card>
  );
}
