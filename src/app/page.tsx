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
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      {/* Animated Heat Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] animate-pulse" />

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Brain className="h-3 w-3" />
            AI-BASED SUNSTROKE DETECTION
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-foreground"
          >
            SMART THERMAL <br /><span className="text-primary">PROTECTION</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Advanced biometric monitoring and real-time environmental analysis to predict and prevent heat-related emergencies.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Link href="/dashboard">
              <Button onClick={handleGetStarted} size="lg" className="h-16 px-10 text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 w-full sm:w-auto rounded-2xl uppercase tracking-tighter">
                Get Started <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold border-muted-foreground/20 hover:bg-muted w-full sm:w-auto rounded-2xl uppercase tracking-tighter">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="py-32 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-foreground">Protocol Workflow</h2>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">A professional multi-stage safety protocol.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <WorkflowStep 
              number="01" 
              icon={Smartphone} 
              title="Secure Sync" 
              description="Connect your biometric sensors and establish a secure data stream." 
            />
            <WorkflowStep 
              number="02" 
              icon={Waves} 
              title="Thermal Scan" 
              description="AI continuously monitors core temperature and environmental heat index." 
            />
            <WorkflowStep 
              number="03" 
              icon={Brain} 
              title="Risk Analysis" 
              description="Our neural engine assesses physiological risk every 10 seconds." 
            />
            <WorkflowStep 
              number="04" 
              icon={Bell} 
              title="Emergency SOS" 
              description="Automatic alerts are dispatched to your network upon critical detection." 
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Defensive Layers</h2>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Engineered for absolute reliability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ActivitySquare} 
              title="Deep Learning Risk" 
              description="Predictive models analyze heart rate variability and core temperature trends."
            />
            <FeatureCard 
              icon={Globe} 
              title="Live GPS Nodes" 
              description="Instant location broadcasting to emergency services during a critical state."
            />
            <FeatureCard 
              icon={Clock} 
              title="10-Sec SOS" 
              description="Autonomous countdown protocol with manual cancellation override."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">HEATGUARD AI</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">© 2026 Thermal Defense Systems. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link>
            <Link href="#" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WorkflowStep({ number, icon: Icon, title, description }: { number: string, icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-border shadow-sm hover:shadow-medical transition-all group">
      <div className="text-4xl font-black text-muted mb-4 group-hover:text-primary/20 transition-colors">{number}</div>
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold uppercase tracking-tight mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-10 rounded-3xl bg-white border border-border shadow-sm hover:shadow-medical transition-all group">
      <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-8 group-hover:bg-secondary group-hover:text-white transition-all">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-bold mb-4 tracking-tight uppercase text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium">{description}</p>
    </div>
  );
}