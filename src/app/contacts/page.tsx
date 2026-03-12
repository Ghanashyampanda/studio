"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  UserPlus,
  Star,
  Settings2
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
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
  { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
  { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
  { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
  { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
  { name: "Russia", dial_code: "+7", code: "RU", flag: "🇷🇺" },
  { name: "South Korea", dial_code: "+82", code: "KR", flag: "🇰🇷" },
  { name: "Singapore", dial_code: "+65", code: "SG", flag: "🇸🇬" },
  { name: "UAE", dial_code: "+971", code: "AE", flag: "🇦🇪" },
];

export default function ContactsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleAdd = () => {
    if (!db || !user) return;
    if (!formData.name || !formData.phoneNumber) {
      toast({ title: "Validation Error", description: "Name and Phone are required.", variant: "destructive" });
      return;
    }

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
    const dialPrefix = selectedCountry?.dial_code || '+1';
    const finalPhone = `${dialPrefix}${formData.phoneNumber.replace(/^\+/, '')}`;

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

    setFormData({ name: '', phoneNumber: '', email: '', relationship: 'Family' });
    setIsAddModalOpen(false);
    toast({ title: "Node Synchronized", description: `${formData.name} added to emergency network.` });
  };

  const handleDelete = (contactId: string) => {
    if (!db || !user) return;
    const contactRef = doc(db, 'users', user.uid, 'emergency_contacts', contactId);
    deleteDocumentNonBlocking(contactRef);
    toast({ title: "Node Removed", description: "Contact has been disconnected from the network." });
  };

  const setPrimary = (contactId: string) => {
    if (!db || !user || !contacts) return;
    
    contacts.forEach(c => {
      const ref = doc(db, 'users', user.uid, 'emergency_contacts', c.id);
      updateDocumentNonBlocking(ref, { isPrimary: c.id === contactId });
    });
    
    toast({ title: "Primary Updated", description: "This node is now your first responder." });
  };

  if (isUserLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-24 pb-20">
      <main className="max-w-5xl mx-auto px-6 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"
            >
              <ArrowLeft className="h-3 w-3" /> Dashboard
            </button>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
              Emergency <span className="text-primary">Network</span>
            </h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest max-w-lg">
              Manage automated SOS nodes and rescue dispatch protocols.
            </p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-xs font-black uppercase tracking-widest group">
                <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Establish New Node
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px] rounded-[2rem] border-none shadow-2xl p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Configure Node</DialogTitle>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Establish a new rescue coordination link</p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Identity</Label>
                  <Input 
                    placeholder="Enter full name" 
                    className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all text-xs font-bold"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Relationship</Label>
                  <Select value={formData.relationship} onValueChange={val => setFormData({...formData, relationship: val})}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-transparent text-xs font-bold">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Family', 'Doctor', 'Friend', 'Caregiver', 'Colleague'].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Node</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[100px] h-11 rounded-xl bg-slate-50 border-transparent text-xs font-bold">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-1.5">
                              <span>{c.flag}</span>
                              <span className="text-[10px]">{c.dial_code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="(555) 000-0000" 
                      className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all text-xs font-bold flex-1"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Node (Optional)</Label>
                  <Input 
                    placeholder="rescue@example.com" 
                    className="h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all text-xs font-bold"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button onClick={handleAdd} className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                  Activate Node Synchronization
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Network Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {contacts?.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative group p-8 rounded-[2.5rem] border-2 transition-all duration-300",
                  contact.isPrimary 
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/10" 
                    : "bg-white border-slate-100 hover:border-primary/20 text-slate-900 hover:shadow-xl hover:shadow-primary/5"
                )}
              >
                {contact.isPrimary && (
                  <Badge className="absolute -top-3 left-8 bg-primary text-white border-none px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                    <Star className="h-3 w-3 mr-2 fill-white" /> Primary Node
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-8">
                  <Avatar className="h-16 w-16 border-2 border-primary/20 p-1">
                    <AvatarImage src={`https://picsum.photos/seed/${contact.id}/100/100`} />
                    <AvatarFallback className="bg-primary/5 text-primary font-black">{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-10 w-10 rounded-xl transition-colors",
                        contact.isPrimary ? "text-slate-400 hover:text-white" : "text-slate-300 hover:text-destructive hover:bg-destructive/5"
                      )}
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{contact.name}</h3>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      contact.isPrimary ? "text-primary" : "text-slate-400"
                    )}>
                      {contact.relationship}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <Phone className={cn("h-4 w-4", contact.isPrimary ? "text-primary" : "text-slate-400")} />
                      <span className="text-xs font-mono font-bold">{contact.phoneNumber}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-3">
                        <Mail className={cn("h-4 w-4", contact.isPrimary ? "text-primary" : "text-slate-400")} />
                        <span className="text-xs font-mono font-bold truncate max-w-[150px]">{contact.email}</span>
                      </div>
                    )}
                  </div>

                  {!contact.isPrimary && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 h-11 rounded-xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px] hover:bg-primary hover:text-white hover:border-primary transition-all"
                      onClick={() => setPrimary(contact.id)}
                    >
                      Establish as Primary
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State / Add Suggestion */}
          {(!contacts || contacts.length === 0) && !isContactsLoading && (
            <div className="col-span-full py-24 text-center space-y-6 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm">
                <UserPlus className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-400">No Nodes Detected</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto">
                  Emergency rescue network is currently offline. Establish nodes immediately.
                </p>
              </div>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50 shadow-sm"
              >
                Add First Node
              </Button>
            </div>
          )}
        </div>

        {/* System Protocols Info */}
        <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" /> Protocol 114 Active
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">
              Safety <span className="text-primary">Protocols</span>
            </h2>
            <div className="space-y-4 text-sm text-slate-500 font-medium leading-relaxed">
              <p>
                The Sunstroke Detection engine utilizes triple-redundancy nodes to ensure emergency communications are delivered even in low-signal environments.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span>Automated GPS telemetry broadcast upon critical detection</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span>Encrypted first-responder data packet delivery</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span>Real-time biometrics sharing active for 60 minutes</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-white border-8 border-white">
                <img 
                  src="https://picsum.photos/seed/protocol/800/450" 
                  alt="Protocol Visualization" 
                  className="w-full h-full object-cover grayscale opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="p-6 bg-white/90 backdrop-blur rounded-2xl border border-slate-100 space-y-2 max-w-xs">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                      <Settings2 className="h-3.5 w-3.5" /> Network Architecture
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase">
                      Nodes are distributed via global reference network for maximum reliability.
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
