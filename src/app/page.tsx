
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Brain, ArrowRight, Activity, Thermometer, Bell, Smartphone, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import { AuthModals } from '@/components/auth/AuthModals';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900 font-body">
      {/* Abstract background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px]" />

      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Shield className="h-3 w-3" />
            Medical Grade Surveillance
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
          >
            AI-Based Sunstroke Detection <br /><span className="text-primary">& Emergency Alert System</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Utilizing advanced biometric analysis and real-time environmental telemetry to protect users from heat-related health emergencies.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Button 
              onClick={handleGetStarted} 
              size="lg" 
              className="h-14 px-10 text-sm font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 w-full sm:w-auto rounded-2xl uppercase tracking-widest"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-sm font-black border-slate-200 hover:bg-slate-50 w-full sm:w-auto rounded-2xl uppercase tracking-widest">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Activity} 
              title="Real-time Vitals" 
              description="Continuous monitoring of core body temperature and heart rate with high-frequency telemetry."
            />
            <FeatureCard 
              icon={Brain} 
              title="AI Risk Prediction" 
              description="Neural engine assesses environmental and physiological data to predict sunstroke risks before they occur."
            />
            <FeatureCard 
              icon={Bell} 
              title="Automated SOS" 
              description="Immediate emergency contact notification and location sharing when critical thresholds are reached."
            />
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">HeatGuard <span className="text-primary">AI</span></span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">© 2026 HeatGuard Systems. All Rights Reserved.</p>
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

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight mb-3">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
