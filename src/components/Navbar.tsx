"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { 
  Shield, 
  Menu, 
  Bell, 
  Sun, 
  LayoutDashboard, 
  Thermometer, 
  Users, 
  AlertTriangle, 
  Home,
  ChevronRight,
  Info,
  GitBranch,
  Zap,
  Moon,
  Smartphone,
  Monitor
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = () => {
    if (!user && auth) initiateAnonymousSignIn(auth);
  };

  const menuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Temperature Monitor', href: '/dashboard', icon: Thermometer },
    { label: 'Emergency Contacts', href: '/contacts', icon: Users },
    { label: 'Alert Status', href: '/alert-sim', icon: AlertTriangle },
    { label: 'Features', href: '/#features', icon: Zap },
    { label: 'How It Works', href: '/#how-it-works', icon: GitBranch },
    { label: 'About', href: '/#about', icon: Info },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-300 px-4 md:px-6",
      isScrolled 
        ? "bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm py-2 border-b" 
        : "bg-white dark:bg-black py-4"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section: Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="relative flex items-center justify-center">
            <Shield className="h-7 w-7 md:h-9 md:w-9 text-primary group-hover:scale-110 transition-transform" />
            <Sun className="h-3 w-3 md:h-4 md:w-4 text-white absolute" />
          </div>
          <span className="text-lg md:text-xl font-extrabold tracking-tight text-foreground">
            HeatGuard <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Center Section: Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "relative h-10 px-3 text-[10px] xl:text-xs font-semibold uppercase tracking-widest hover:text-primary transition-colors",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div 
                    layoutId="activeNav" 
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" 
                  />
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Global Watch/Mobile/Desktop View Indicators (Visible on All) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-muted relative"
            title="System Notifications"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-secondary rounded-full border-2 border-background" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="flex h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-muted"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>

          <AnimatePresence mode="wait">
            {!user ? (
              <Button 
                key="login-btn"
                onClick={handleLogin} 
                disabled={isUserLoading}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-9 md:h-10 px-3 md:px-5 rounded-full shadow-md text-[10px] uppercase tracking-widest"
              >
                {isUserLoading ? "..." : "Sign Up"}
              </Button>
            ) : (
              <div key="user-profile" className="hidden xs:flex items-center gap-2">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Mobile Menu Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 md:h-10 md:w-10 rounded-full">
                <Menu className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white dark:bg-black w-[280px] p-0 border-l">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary" />
                    <Sun className="h-3 w-3 text-white absolute" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">HeatGuard AI</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-4 h-12 rounded-xl text-sm font-semibold",
                        pathname === item.href ? "bg-primary/5 text-primary" : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                      <ChevronRight className="ml-auto h-4 w-4 opacity-30" />
                    </Button>
                  </Link>
                ))}
              </div>
              
              {/* Mobile Drawer Footer with Quick Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-muted/30 border-t space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div className="h-4 w-4 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                        <rect x="6" y="2" width="12" height="20" rx="4" ry="4" />
                        <path d="M6 12h12" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                      </svg>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme} className="h-9 gap-2 rounded-xl text-[10px] font-bold uppercase">
                    {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    Theme
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                    Multi-Device AI Protocol
                  </p>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-primary" 
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}