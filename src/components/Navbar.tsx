"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { 
  Shield, 
  Menu, 
  X, 
  Bell, 
  Sun, 
  User, 
  LayoutDashboard, 
  Thermometer, 
  Users, 
  AlertTriangle, 
  Zap, 
  Info, 
  Eye, 
  Home,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    if (!user && auth) initiateAnonymousSignIn(auth);
  };

  const menuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Temp Monitor', href: '/dashboard', icon: Thermometer },
    { label: 'SOS Network', href: '/contacts', icon: Users },
    { label: 'Alert Status', href: '/alert-sim', icon: AlertTriangle },
    { label: 'Features', href: '/#features', icon: Zap },
    { label: 'How It Works', href: '/#how-it-works', icon: GitBranch },
    { label: 'Vision', href: '/#vision', icon: Eye },
    { label: 'About', href: '/#about', icon: Info },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-300 px-6 py-4",
      isScrolled ? "glass-dark border-b border-white/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">
            HEATGUARD <span className="text-primary font-light">AI</span>
          </span>
        </Link>

        {/* Center Menu: Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "relative h-10 px-4 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-full",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div 
                    layoutId="activeNav" 
                    className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full" 
                  />
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex h-10 w-10 rounded-xl glass hover:bg-white/10 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-secondary rounded-full border border-background animate-pulse" />
          </Button>

          <AnimatePresence mode="wait">
            {!user ? (
              <Button 
                key="login-btn"
                onClick={handleLogin} 
                disabled={isUserLoading}
                className="bg-primary hover:bg-primary/90 text-white font-black h-10 px-6 rounded-xl shadow-lg shadow-primary/20 text-xs uppercase tracking-widest"
              >
                {isUserLoading ? "..." : "Launch App"}
              </Button>
            ) : (
              <div key="user-profile" className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Mobile Menu Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl glass">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-dark border-l border-white/5 w-[300px] p-0">
              <SheetHeader className="p-8 border-b border-white/5">
                <SheetTitle className="flex items-center gap-3 text-left">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-xl font-black uppercase tracking-tighter">HeatGuard AI</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-2">
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-4 h-14 rounded-2xl",
                        pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-bold tracking-tight">{item.label}</span>
                      <ChevronRight className="ml-auto h-4 w-4 opacity-20" />
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-4 text-center">Active Safety Monitoring</p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-primary/50" 
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
