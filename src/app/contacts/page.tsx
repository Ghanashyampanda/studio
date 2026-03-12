"use client";

import { SOSPanel } from '@/components/dashboard/SOSPanel';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24">
      <main className="p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-6 mb-12">
          <Link href="/dashboard" className="h-12 w-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Emergency <span className="text-primary">Network</span></h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Configure automated SOS nodes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <SOSPanel />
          
          <div className="space-y-6">
            <div className="p-8 rounded-[2rem] glass-dark border-white/5 space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-tight">SOS Protocols</h3>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  When a sunstroke condition is identified by the AI Risk Engine, the system initiates a 10-second countdown.
                </p>
                <p>
                  If not cancelled, an automated broadcast containing your precise GPS coordinates, heart rate, and body temperature is sent via SMS and Email to all active nodes in your network.
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Triple-redundancy notification system</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Real-time location tracking active for 60 mins</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Direct integration with local emergency dispatch</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] glass bg-primary/5 border-primary/20">
              <h4 className="font-black uppercase text-xs tracking-[0.2em] text-primary mb-2">Network Status</h4>
              <p className="text-sm font-medium">Your emergency network is currently ARMED. Notifications will trigger automatically upon critical thermal detection.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
