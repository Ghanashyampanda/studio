"use client";

import { Button } from '@/components/ui/button';
import { Shield, Zap, Thermometer, MapPin, Activity, ArrowRight, ChevronRight, Bell, Heart, Sun, Clock, Smartphone, Waves, Brain, ActivitySquare, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleGetStarted = () => {
    if (!user && auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated Heat Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tighter">HEATGUARD <span className="text-primary font-light">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">How it Works</Link>
            <Link href="#features" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Features</Link>
            <Link href="/dashboard">
              <Button onClick={handleGetStarted} variant="default" className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-primary/20">
                {isUserLoading ? "Loading..." : user ? "Dashboard" : "Launch App"}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Brain className="h-3 w-3" />
            Predictive Thermal Intelligence
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]"
          >
            AI-BASED <span className="text-gradient">SUNSTROKE</span> DETECTION
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Real-time biometric monitoring and environmental analysis to stop heat-related emergencies before they happen.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/dashboard">
              <Button onClick={handleGetStarted} size="lg" className="h-16 px-10 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 w-full sm:w-auto rounded-2xl">
                GET STARTED FREE <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">SMART WORKFLOW</h2>
            <p className="text-muted-foreground font-medium">Four layers of protection against extreme heat.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 hidden md:block -translate-y-1/2 -z-10" />
            
            <WorkflowStep 
              number="01" 
              icon={Smartphone} 
              title="Sync Devices" 
              description="Connect your smartwatch or wearable to begin real-time data streaming." 
            />
            <WorkflowStep 
              number="02" 
              icon={Waves} 
              title="Thermal Scan" 
              description="AI analyzes body core temp and environmental heat index every 30 seconds." 
            />
            <WorkflowStep 
              number="03" 
              icon={Brain} 
              title="Risk Analysis" 
              description="If core temp hits 40°C, the system identifies a critical sunstroke state." 
            />
            <WorkflowStep 
              number="04" 
              icon={Bell} 
              title="SOS Trigger" 
              description="Emergency alerts with live location are sent to your network instantly." 
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 glass bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Defensive Layers</h2>
            <p className="text-muted-foreground font-medium">Engineered for the most extreme environments on Earth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ActivitySquare} 
              title="Deep Learning Risk" 
              description="Proprietary neural networks predict physiological failure points based on historical trends."
            />
            <FeatureCard 
              icon={Globe} 
              title="Hyper-Local GPS" 
              description="Broadcasts your precise coordinates to emergency services and contacts during an alert."
            />
            <FeatureCard 
              icon={Clock} 
              title="10-Sec SOS" 
              description="Automated countdown allows for false-alert cancellation before SOS broadcast."
            />
            <FeatureCard 
              icon={Thermometer} 
              title="Env-Sync AI" 
              description="Calculates real-feel heat indices by combining biometric data with local weather APIs."
            />
            <FeatureCard 
              icon={Shield} 
              title="Encrypted Data" 
              description="Your biometric data is fully encrypted and stored securely on our decentralized network."
            />
            <FeatureCard 
              icon={Heart} 
              title="Vital Resilience" 
              description="Monitors heart rate variability (HRV) to gauge your body's recovery and heat tolerance."
            />
          </div>
        </div>
      </section>

      {/* Future Vision Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-[3rem] p-12 md:p-20 border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sun className="h-64 w-64 animate-spin-slow" />
            </div>
            <div className="max-w-2xl space-y-8 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">FUTURE OF <br /><span className="text-primary">THERMAL SAFETY</span></h2>
              <div className="space-y-6">
                <VisionItem title="HOSPITAL INTEGRATION" description="Direct vitals streaming to local ER triage systems for immediate medical prep." />
                <VisionItem title="PREDICTIVE WARNINGS" description="AI alerts sent 2 hours before a heatwave reaches dangerous levels for your profile." />
                <VisionItem title="VOICE COMMAND SOS" description="Hands-free emergency triggering via natural language processing." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-black tracking-tighter">HEATGUARD AI</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">© 2024 Thermal Defense Systems. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs font-bold hover:text-white transition-colors uppercase tracking-widest">Privacy</Link>
            <Link href="#" className="text-xs font-bold hover:text-white transition-colors uppercase tracking-widest">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkflowStep({ number, icon: Icon, title, description }: { number: string, icon: any, title: string, description: string }) {
  return (
    <div className="space-y-6 relative group">
      <div className="text-5xl font-black text-white/5 absolute -top-10 -left-4 group-hover:text-primary/10 transition-colors">{number}</div>
      <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl">
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-10 rounded-3xl glass hover:bg-white/10 transition-all group border-white/5 border hover:border-primary/20">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function VisionItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="h-2 w-2 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform" />
      <div className="space-y-1">
        <h4 className="text-lg font-black tracking-tight">{title}</h4>
        <p className="text-muted-foreground text-sm font-medium">{description}</p>
      </div>
    </div>
  );
}
