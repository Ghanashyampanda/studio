
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trash2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowLeft,
  UserPlus,
  Star,
  Pencil,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COUNTRY_CODES = [
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
];

export default function ContactsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('US');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    relationship: 'Family'
  });

  const contactsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'emergency_contacts');
  }, [db, user]);
  const { data: contacts, isLoading: isContactsLoading } = useCollection(contactsQuery);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', phoneNumber: '', email: '', relationship: 'Family' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: any) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber.replace(/^\+\d+/, ''),
      email: contact.email || '',
      relationship: contact.relationship
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!db || !user) return;
    if (!formData.name || !formData.phoneNumber) {
      toast({ title: "Validation Error", description: "Name and Phone are required.", variant: "destructive" });
      return;
    }

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
    const dialPrefix = selectedCountry?.dial_code || '+1';
    const finalPhone = `${dialPrefix}${formData.phoneNumber.replace(/^\+/, '')}`;

    if (editingId) {
      const contactRef = doc(db, 'users', user.uid, 'emergency_contacts', editingId);
      updateDocumentNonBlocking(contactRef, {
        name: formData.name,
        phoneNumber: finalPhone,
        email: formData.email,
        relationship: formData.relationship
      });
      toast({ title: "Node Updated", description: "Contact information synchronized." });
    } else {
      const contactsRef = collection(db, 'users', user.uid, 'emergency_contacts');
      addDocumentNonBlocking(contactsRef, {
        userId: user.uid,
        name: formData.name,
        phoneNumber: finalPhone,
        email: formData.email,
        relationship: formData.relationship,
        isPrimary: (contacts?.length || 0) === 0,
        enabledForAlerts: true,
        dateAdded: new Date().toISOString()
      });
      toast({ title: "Node Synchronized", description: `${formData.name} added to emergency network.` });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (contactId: string) => {
    if (!db || !user) return;
    const contactRef = doc(db, 'users', user.uid, 'emergency_contacts', contactId);
    deleteDocumentNonBlocking(contactRef);
    toast({ title: "Node Removed", description: "Contact disconnected from the network." });
  };

  const setPrimary = (contactId: string) => {
    if (!db || !user || !contacts) return;
    contacts.forEach(c => {
      const ref = doc(db, 'users', user.uid, 'emergency_contacts', c.id);
      updateDocumentNonBlocking(ref, { isPrimary: c.id === contactId });
    });
    toast({ title: "Primary Updated", description: "Primary responder designated." });
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-24 pb-20 font-body">
      <main className="max-w-5xl mx-auto px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all">
              <ArrowLeft className="h-3 w-3" /> Dashboard
            </button>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Emergency <span className="text-primary">Network</span></h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest max-w-lg">Manage automated SOS nodes and rescue protocols.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} size="lg" className="h-14 px-8 rounded-2xl bg-primary text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                <UserPlus className="mr-2 h-4 w-4" /> Establish New Node
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px] rounded-[2rem] border-none shadow-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">{editingId ? 'Edit Node' : 'Configure Node'}</DialogTitle>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rescue coordination link details</p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Full Identity</Label>
                  <Input placeholder="Enter name" className="h-11 rounded-xl bg-slate-50 border-transparent text-xs font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Relationship</Label>
                  <Select value={formData.relationship} onValueChange={val => setFormData({...formData, relationship: val})}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-transparent text-xs font-bold">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Family', 'Doctor', 'Friend', 'Caregiver'].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Phone Node</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[80px] h-11 rounded-xl bg-slate-50 border-transparent text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.flag}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Phone" className="h-11 rounded-xl bg-slate-50 border-transparent text-xs font-bold flex-1" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px]">
                  {editingId ? 'Update Synchronization' : 'Activate Synchronization'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {contacts?.map((contact) => (
              <motion.div key={contact.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("relative p-8 rounded-[2.5rem] border-2 transition-all", contact.isPrimary ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100")}>
                {contact.isPrimary && (
                  <Badge className="absolute -top-3 left-8 bg-primary text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">
                    <Star className="h-3 w-3 mr-2 fill-white" /> Primary Node
                  </Badge>
                )}
                <div className="flex items-start justify-between mb-8">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 p-1">
                    <AvatarImage src={`https://picsum.photos/seed/${contact.id}/100/100`} />
                    <AvatarFallback className="bg-primary/5 text-primary font-black">{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary" onClick={() => handleOpenEdit(contact)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-destructive" onClick={() => handleDelete(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{contact.name}</h3>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", contact.isPrimary ? "text-primary" : "text-slate-400")}>{contact.relationship}</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-xs font-mono font-bold">{contact.phoneNumber}</span>
                    </div>
                  </div>
                  {!contact.isPrimary && (
                    <Button variant="outline" className="w-full mt-2 h-10 rounded-xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px]" onClick={() => setPrimary(contact.id)}>
                      Designate Primary
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-10">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">Safety Protocol 114</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
              Nodes are distributed via global reference network. SOS broadcasts utilize triple-redundancy to ensure delivery in low-signal environments.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
