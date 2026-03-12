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
  Moon
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
      "fixed top-0 w-full z-[100] transition-all duration-300 px-6",
      isScrolled 
        ? "bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm py-2 border-b" 
        : "bg-white dark:bg-black py-4"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <Shield className="h-9 w-9 text-primary group-hover:scale-110 transition-transform" />
            <Sun className="h-4 w-4 text-white absolute" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            HeatGuard <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Center Section: Desktop Menu */}
        <div className="hidden lg:flex items-center gap-2">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "relative h-10 px-4 text-xs font-semibold uppercase tracking-widest hover:text-primary transition-colors",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div 
                    layoutId="activeNav" 
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" 
                  />
                )}
                {/* Hover Underline Animation */}
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex h-10 w-10 rounded-full hover:bg-muted relative"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-secondary rounded-full border-2 border-background" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="h-10 w-10 rounded-full hover:bg-muted"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <AnimatePresence mode="wait">
            {!user ? (
              <Button 
                key="login-btn"
                onClick={handleLogin} 
                disabled={isUserLoading}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-5 rounded-full shadow-md text-xs uppercase tracking-widest"
              >
                {isUserLoading ? "..." : "Sign Up"}
              </Button>
            ) : (
              <div key="user-profile" className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Mobile Menu Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white dark:bg-black w-[300px] p-0 border-l">
              <SheetHeader className="p-8 border-b">
                <SheetTitle className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary" />
                    <Sun className="h-3 w-3 text-white absolute" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">HeatGuard AI</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-1">
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
              <div className="absolute bottom-8 left-6 right-6 p-6 bg-muted/50 rounded-2xl">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center mb-4">
                  AI Protocol Monitoring
                </p>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-full bg-primary" 
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
