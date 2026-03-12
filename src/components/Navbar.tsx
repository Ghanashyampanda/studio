"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
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
  Monitor,
  LogIn
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
import { signOut } from 'firebase/auth';

export function Navbar() {
  const { user } = useUser();
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

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  // Simplified menu for desktop to avoid overcrowding
  const desktopMenuItems = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Contacts', href: '/contacts' },
    { label: 'Features', href: '/#features' },
    { label: 'About', href: '/#about' },
  ];

  // Full menu for mobile sheet
  const mobileMenuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Monitor', href: '/dashboard', icon: Thermometer },
    { label: 'Contacts', href: '/contacts', icon: Users },
    { label: 'Alert Protocol', href: '/alert-sim', icon: AlertTriangle },
    { label: 'How It Works', href: '/#how-it-works', icon: GitBranch },
    { label: 'About', href: '/#about', icon: Info },
  ];

  const authRoutes = ['/login', '/signup'];
  const isAuthPage = authRoutes.includes(pathname);

  if (isAuthPage) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-300 px-4 md:px-6",
      isScrolled 
        ? "bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm py-2 border-b" 
        : "bg-white/80 dark:bg-black/80 backdrop-blur-sm py-4"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section: Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 mr-4">
          <div className="relative flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
            <Sun className="h-3.5 w-3.5 text-white absolute" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline-block">
            HeatGuard <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Center Section: Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {desktopMenuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "relative h-9 px-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                  pathname === item.href ? "text-primary" : "text-foreground/70 hover:text-secondary"
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
          <Link href="/#how-it-works">
            <Button className="h-9 px-4 rounded-full bg-accent/20 hover:bg-accent/30 text-accent-foreground text-[11px] font-bold uppercase tracking-widest border border-accent/20">
              How It Works
            </Button>
          </Link>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-foreground/70"
            title="Alerts"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-secondary rounded-full border-2 border-background" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full text-foreground/70"
            title="Theme"
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>

          <AnimatePresence mode="wait">
            {!user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="h-9 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-4 rounded-full shadow-lg shadow-primary/10 text-[10px] uppercase tracking-widest"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div key="user-profile" className="flex items-center gap-2">
                <div 
                  onClick={handleLogout}
                  className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all group relative"
                >
                  <span className="group-hover:opacity-0 transition-opacity text-xs">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </span>
                  <LogIn className="absolute inset-0 m-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity rotate-180" />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Mobile Menu Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full ml-1">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white dark:bg-black w-[300px] p-0 border-l">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                    <Sun className="h-4 w-4 text-white absolute" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">HeatGuard AI</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                {mobileMenuItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-4 h-12 rounded-xl text-xs font-bold uppercase tracking-wider",
                        pathname === item.href ? "bg-primary/5 text-primary border-r-4 border-primary" : "text-foreground/70"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      <ChevronRight className="ml-auto h-3 w-3 opacity-30" />
                    </Button>
                  </Link>
                ))}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-muted/30 border-t space-y-4">
                <div className="flex flex-col gap-2">
                  {!user ? (
                    <>
                      <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest">Sign In</Button>
                      </Link>
                      <Link href="/signup" className="w-full">
                        <Button className="w-full h-11 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest">Sign Up</Button>
                      </Link>
                    </>
                  ) : (
                    <Button onClick={handleLogout} variant="destructive" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest">Sign Out</Button>
                  )}
                </div>
                <div className="flex items-center justify-between px-2 pt-2 border-t border-border/10">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground/50" />
                    <Smartphone className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Protocols Active</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}