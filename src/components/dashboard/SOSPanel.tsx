"use client";

import { useState } from 'react';
import { useAppContext } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Phone, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SOSPanel() {
  const { emergencyContacts, addContact, removeContact } = useAppContext();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newType, setNewType] = useState<'phone' | 'email'>('phone');

  const handleAdd = () => {
    if (emergencyContacts.length >= 3) {
      toast({ title: "Limit reached", description: "You can only have 3 emergency contacts.", variant: "destructive" });
      return;
    }
    if (!newName || !newContact) return;
    addContact({ name: newName, contact: newContact, type: newType });
    setNewName('');
    setNewContact('');
    toast({ title: "Contact added", description: `${newName} has been added to your emergency list.` });
  };

  const triggerSOS = () => {
    toast({
      title: "SOS ALERT TRIGGERED",
      description: "Emergency contacts have been notified via SMS and Email.",
      variant: "destructive",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {emergencyContacts.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {contact.type === 'phone' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.contact}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeContact(contact.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {emergencyContacts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 italic">No contacts added yet.</p>
          )}
        </div>

        {emergencyContacts.length < 3 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input id="name" size={32} className="h-8" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="type" className="text-xs">Type</Label>
                <div className="flex gap-1">
                  <Button variant={newType === 'phone' ? 'secondary' : 'outline'} size="sm" className="h-8 flex-1 text-xs" onClick={() => setNewType('phone')}>Phone</Button>
                  <Button variant={newType === 'email' ? 'secondary' : 'outline'} size="sm" className="h-8 flex-1 text-xs" onClick={() => setNewType('email')}>Email</Button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact" className="text-xs">{newType === 'phone' ? 'Phone Number' : 'Email Address'}</Label>
              <div className="flex gap-2">
                <Input id="contact" className="h-9" value={newContact} onChange={e => setNewContact(e.target.value)} placeholder={newType === 'phone' ? '555-0123' : 'email@example.com'} />
                <Button size="icon" onClick={handleAdd} disabled={!newName || !newContact}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="destructive" className="w-full font-bold shadow-lg shadow-destructive/20 h-12" onClick={triggerSOS}>
          TRIGGER MANUAL SOS
        </Button>
      </CardFooter>
    </Card>
  );
}
