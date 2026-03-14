"use client";

import { Shield, Brain, Activity, Heart, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20 font-body">
      <main className="max-w-4xl mx-auto px-6 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <Shield className="h-3 w-3" /> Mission Protocol
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-tight text-foreground">
            Advanced Thermal <span className="text-primary">Defense</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            HeatGuard AI is a medical-grade physiological monitoring platform designed to protect individuals and workers from hyperthermia in extreme environments.
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AboutCard 
            icon={Brain} 
            title="Predictive Intelligence" 
            description="Our neural engine doesn't just monitor data; it anticipates heat stress by analyzing complex relationships between environmental humidity, radiant heat, and core physiological response."
          />
          <AboutCard 
            icon={Activity} 
            title="High-Frequency Monitoring" 
            description="Telemetry is captured at 10-second intervals, providing a high-resolution audit trail of cardiovascular and thermal stability."
          />
          <AboutCard 
            icon={Users} 
            title="Community Safety" 
            description="Built for lone workers, athletes, and the elderly, our system bridges the gap between isolation and immediate medical rescue."
          />
          <AboutCard 
            icon={Globe} 
            title="Global Reliability" 
            description="Utilizing distributed nodes and fail-safe communication protocols to ensure SOS messages are dispatched regardless of local signal degradation."
          />
        </div>

        {/* Detailed Mission */}
        <div className="bg-card p-12 rounded-[3rem] border border-border shadow-sm space-y-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">The <span className="text-primary">Problem</span></h2>
          <div className="space-y-6 text-muted-foreground font-medium leading-relaxed">
            <p>
              As global temperatures reach historic highs, heat-related illnesses like sunstroke have become a significant public health challenge. Traditional monitoring is often manual and reactive—by the time symptoms appear, the risk is already critical.
            </p>
            <p>
              <strong>HeatGuard AI</strong> solves this through proactive, automated surveillance. By integrating with medical-grade biometric sensors and real-time environmental APIs, we create a defensive barrier that works 24/7 to ensure thermal stability.
            </p>
          </div>
          <div className="pt-8 border-t border-border flex items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Lives Monitored</p>
              <p className="text-2xl font-black text-foreground tracking-tighter">12,482+</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AboutCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-4">
      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
    </div>
  );
}