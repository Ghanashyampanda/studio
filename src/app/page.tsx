"use client";

import { AppProvider, useAppContext } from './context/AppContext';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Thermometer, MapPin, Activity, ArrowRight, ChevronRight, Bell, Heart, Sun } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Heat Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">HeatGuard <span className="text-primary">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
            <Link href="/dashboard">
              <Button variant="default" className="bg-primary hover:bg-primary/90 text-white font-semibold">
                Launch Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Zap className="h-3 w-3" />
            Next-Gen Heat Safety
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            AI-Based <span className="text-gradient">Sunstroke Detection</span> & Emergency Alert System
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Leveraging real-time biometrics and environmental data to predict heat-related risks before they become emergencies.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 w-full sm:w-auto">
                Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold glass hover:bg-white/10 w-full sm:w-auto">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Intelligent Features</h2>
            <p className="text-muted-foreground">Built for safety, accuracy, and lightning-fast response.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Activity} 
              title="AI Risk Assessment" 
              description="Our proprietary models analyze vital signs 24/7 to determine your precise sunstroke risk score."
            />
            <FeatureCard 
              icon={Bell} 
              title="Instant SOS Alerts" 
              description="When a threshold is crossed, emergency contacts are notified within 10 seconds automatically."
            />
            <FeatureCard 
              icon={MapPin} 
              title="Live Location" 
              description="Alerts include high-precision GPS coordinates to help first responders find you instantly."
            />
            <FeatureCard 
              icon={Thermometer} 
              title="Environmental Sync" 
              description="Monitors outside humidity and heat index to provide context for your body's thermal state."
            />
            <FeatureCard 
              icon={Shield} 
              title="Triple-Redundancy" 
              description="Alerts are sent via SMS, Email, and Push Notifications to ensure they reach their target."
            />
            <FeatureCard 
              icon={Heart} 
              title="Health Trends" 
              description="Visual historical data helps you understand how your body reacts to different heat levels."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">HeatGuard AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 HeatGuard Systems. For educational and monitoring purposes only.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-white">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-white">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl glass hover:bg-white/10 transition-all group border-white/5">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <LandingPage />
    </AppProvider>
  );
}
