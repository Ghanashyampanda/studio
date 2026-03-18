"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Brain, 
  ArrowRight, 
  Activity, 
  Bell, 
  Thermometer, 
  MapPin, 
  Zap, 
  Smartphone, 
  Watch, 
  Globe, 
  Hospital,
  Droplets,
  Sun,
  Wind,
  CheckCircle2,
  Twitter,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import { AuthModals } from '@/components/auth/AuthModals';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      setAuthMode('signup');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground font-body">
      {/* Abstract background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/5"
          >
            <Shield className="h-3.5 w-3.5" />
            Medical Grade Surveillance Protocol
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
          >
            Sunstroke Detection <br /><span className="text-primary">& Emergency Alert</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Utilizing high-frequency biometric analysis and real-time environmental telemetry to protect users from critical heat-related health emergencies.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8"
          >
            <Button 
              onClick={handleGetStarted} 
              size="lg" 
              className="h-16 px-12 text-xs font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 w-full sm:w-auto rounded-3xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              Initialize Protection <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-16 px-12 text-xs font-black border-border bg-background hover:bg-muted text-foreground w-full sm:w-auto rounded-3xl uppercase tracking-widest transition-all"
            >
              Review Protocol
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Horizontal Timeline */}
      <section className="py-32 px-6 bg-muted/20 relative">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter">How It <span className="text-primary">Works</span></h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">The Architecture of Thermal Defense</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-border hidden md:block -z-10" />
            
            <WorkflowStep 
              number="01" 
              icon={Smartphone} 
              title="Identity Sync" 
              description="Login to the SunCare nexus to establish your health profile." 
            />
            <WorkflowStep 
              number="02" 
              icon={Thermometer} 
              title="Data Input" 
              description="Enter real-time body and ambient temperature metrics." 
            />
            <WorkflowStep 
              number="03" 
              icon={Brain} 
              title="AI Analysis" 
              description="Our neural engine assesses physiological stability and heat index." 
            />
            <WorkflowStep 
              number="04" 
              icon={Zap} 
              title="Detection" 
              description="Critical risk is identified before symptoms become irreversible." 
            />
            <WorkflowStep 
              number="05" 
              icon={Bell} 
              title="SOS Dispatch" 
              description="Rescue nodes are signaled with your precise live location." 
            />
          </div>
        </div>
      </section>

      {/* Live Map Visualization */}
      <section className="py-32 px-6 bg-slate-900 dark:bg-card text-white dark:text-foreground">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
              <Globe className="h-4 w-4" /> Global Intelligence
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Tactical <span className="text-primary">Heat Mapping</span></h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Our system integrates high-resolution environmental data with personal biometrics to visualize risk zones. We track radiant heat and humidity to provide a comprehensive defensive map of your surroundings.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">Precise Localization</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Marker accuracy within 3 meters</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Hospital className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">Medical Proximity</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">312 Trauma centers integrated</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-square bg-slate-800 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl group">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop')] bg-cover opacity-20 grayscale transition-transform duration-1000 group-hover:scale-110" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
             
             {/* Map Markers */}
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute top-1/3 left-1/2 h-20 w-20 -ml-10 -mt-10 bg-red-500/30 rounded-full blur-xl" 
             />
             <div className="absolute top-1/3 left-1/2 h-4 w-4 -ml-2 -mt-2 bg-red-500 rounded-full border-2 border-white shadow-xl z-10" />
             <div className="absolute bottom-1/4 right-1/4 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white shadow-xl z-10" />
             <div className="absolute top-1/4 right-1/3 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white shadow-xl z-10" />
             
             {/* HUD Overlay */}
             <div className="absolute bottom-10 left-10 right-10 p-6 rounded-[2rem] bg-black/60 backdrop-blur-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span>Tactical Overlook</span>
                  <span className="animate-pulse">Live</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Ambient</p>
                    <p className="text-xl font-black">40.2°C</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Risk Index</p>
                    <p className="text-xl font-black text-red-500 uppercase">Critical</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Smartwatch Integration */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 relative group">
             <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all" />
             <div className="relative bg-card border border-border rounded-[4rem] p-12 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                <Watch className="h-48 w-48 text-primary opacity-10 absolute rotate-12" />
                <Image 
                  src="https://picsum.photos/seed/watch77/800/800" 
                  alt="Smartwatch Integration" 
                  width={400} 
                  height={400} 
                  className="relative z-10 rounded-[3rem] shadow-2xl border-4 border-background"
                  data-ai-hint="smartwatch interface"
                />
                <div className="absolute bottom-12 right-12 bg-primary text-primary-foreground p-6 rounded-[2rem] shadow-2xl z-20">
                   <Activity className="h-8 w-8 animate-pulse" />
                </div>
             </div>
          </div>
          
          <div className="w-full md:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
              <Zap className="h-4 w-4" /> Wearable Nexus
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Automated <span className="text-primary">Wearable Link</span></h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Future-proof your safety with seamless smartwatch integration. SunCare Alert is engineering a bridge to medical-grade wearables for continuous, automated telemetry without manual interaction.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm font-black uppercase tracking-tight">10-Second High-Frequency Scanning</span>
              </li>
              <li className="flex items-center gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm font-black uppercase tracking-tight">Automated SOS Protocol (Hands-Free)</span>
              </li>
              <li className="flex items-center gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm font-black uppercase tracking-tight">Cardiovascular Stability Monitoring</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* AI Health Safety Tips */}
      <section className="py-32 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Defense <span className="text-primary">Protocols</span></h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">AI-Generated Prevention Guidelines</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SafetyCard 
              icon={Droplets} 
              title="Hyper-Hydration" 
              description="Consume 250ml of electrolyte-balanced water every 20 minutes in high-risk zones." 
            />
            <SafetyCard 
              icon={Sun} 
              title="UV Avoidance" 
              description="Seek shade between 11:00 and 16:00 when the heat index exceeds 38°C." 
            />
            <SafetyCard 
              icon={Wind} 
              title="Thermal Ventilation" 
              description="Utilize high-flow air environments and lightweight breathable synthetics." 
            />
            <SafetyCard 
              icon={Activity} 
              title="Vitals Audit" 
              description="Perform manual biometric checks if wearable synchronization is disconnected." 
            />
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-primary p-16 md:p-24 rounded-[4rem] text-primary-foreground shadow-3xl shadow-primary/30 relative overflow-hidden text-center space-y-10"
          >
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-white/10 rounded-full blur-[120px] -mr-[10%] -mt-[10%]" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-black/10 rounded-full blur-[120px] -ml-[10%] -mb-[10%]" />
            
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight relative z-10">
              Stay Safe in Extreme <br />Heat with AI Protection
            </h2>
            <p className="text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto relative z-10">
              Join thousands of protected users and workers worldwide. Establish your emergency nexus today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 pt-6">
              <Button 
                onClick={handleGetStarted}
                className="h-16 px-12 bg-white text-primary hover:bg-white/90 rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl"
              >
                Get Started Now
              </Button>
              <Button 
                variant="outline" 
                className="h-16 px-12 border-white/20 hover:bg-white/10 text-white rounded-3xl text-xs font-black uppercase tracking-widest"
              >
                Create Free Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-12 px-6 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                  <Sun className="h-4 w-4 text-primary-foreground absolute" />
                </div>
                <span className="text-xl font-black tracking-tighter text-foreground uppercase">SunCare <span className="text-primary">Alert</span></span>
              </Link>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Advanced thermal defense systems utilizing neural biometrics for global health safety.
              </p>
              <div className="flex items-center gap-4">
                <SocialIcon icon={Twitter} />
                <SocialIcon icon={Github} />
                <SocialIcon icon={Linkedin} />
                <SocialIcon icon={Mail} />
              </div>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-6">System Nodes</h4>
              <ul className="space-y-4">
                <FooterLink label="Surveillance Dashboard" href="/dashboard" />
                <FooterLink label="Biometric Monitor" href="/monitor" />
                <FooterLink label="Rescue Network" href="/contacts" />
                <FooterLink label="Location Tracking" href="/location" />
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-6">Protocols</h4>
              <ul className="space-y-4">
                <FooterLink label="Mission Protocol" href="/about" />
                <FooterLink label="Forensic Audit" href="/alerts" />
                <FooterLink label="Safety Guidelines" href="/tips" />
                <FooterLink label="System Status" href="#" />
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-6">Contact Nexus</h4>
              <ul className="space-y-4">
                <li className="text-sm font-medium text-muted-foreground">Emergency Hub: +1 (800) HEAT-SOS</li>
                <li className="text-sm font-medium text-muted-foreground">Tech Ops: ops@suncarealert.ai</li>
                <li className="text-sm font-medium text-muted-foreground">Headquarters: Silicon Valley, CA</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              © 2026 SunCare Alert Systems Group. All physiological data is end-to-end encrypted.
            </p>
            <div className="flex gap-8">
              <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacy Node</Link>
              <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Terms of Op</Link>
              <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Security Cert</Link>
            </div>
          </div>
        </div>
      </footer>

      <AuthModals 
        mode={authMode} 
        onClose={() => setAuthMode(null)} 
        onSwitch={(mode) => setAuthMode(mode)} 
      />
    </div>
  );
}

function WorkflowStep({ number, icon: Icon, title, description }: { number: string, icon: any, title: string, description: string }) {
  return (
    <div className="space-y-6 text-center md:text-left group">
      <div className="relative inline-block">
        <div className="h-16 w-16 rounded-2xl bg-background border-2 border-border flex items-center justify-center text-primary relative z-10 transition-all group-hover:border-primary group-hover:bg-primary/5">
          <Icon className="h-7 w-7" />
        </div>
        <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black z-20 shadow-lg">
          {number}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function SafetyCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[3rem] bg-card border border-border shadow-sm hover:shadow-2xl transition-all group">
      <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight mb-4">{title}</h3>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
    </div>
  );
}

function SocialIcon({ icon: Icon }: { icon: any }) {
  return (
    <button className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
      <Icon className="h-4 w-4" />
    </button>
  );
}

function FooterLink({ label, href }: { label: string, href: string }) {
  return (
    <li>
      <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest text-[10px] font-black">
        {label}
      </Link>
    </li>
  );
}
