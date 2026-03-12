"use client";

import { AppProvider } from '../context/AppContext';
import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { Shield, LayoutDashboard, Users, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ContactsContent() {
  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col glass-dark border-r border-white/5 sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">HeatGuard <span className="text-primary">AI</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/contacts">
            <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              <Users className="h-4 w-4" /> Contacts
            </Button>
          </Link>
          <Link href="/alert-sim">
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-white/5 text-secondary">
              <AlertTriangle className="h-4 w-4" /> Simulate Alert
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        <header className="glass-dark border-b border-white/5 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="lg:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h2 className="text-xl font-bold">Emergency <span className="text-muted-foreground font-normal">Network</span></h2>
          </div>
        </header>

        <main className="p-6 max-w-2xl mx-auto w-full">
          <SOSPanel />
          
          <div className="mt-8 p-8 rounded-2xl glass-dark border-white/5 space-y-4">
            <h3 className="font-bold">About SOS Protocols</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When an alert is triggered, the system sends an automated voice call and SMS containing your live location and vitals to all contacts listed above. 
              <br /><br />
              Ensure your contacts have verified their numbers to receive critical life-safety notifications.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <AppProvider>
      <ContactsContent />
    </AppProvider>
  );
}
