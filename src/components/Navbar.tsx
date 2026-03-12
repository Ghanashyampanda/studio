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
  LogIn,
  UserPlus
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

  const handleLogout = () => {
    if (auth) signOut(auth);
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

  const authRoutes = ['/login', '/signup'];
  const isAuthPage = authRoutes.includes(pathname);

  if (isAuthPage) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-300 px-4 md:px-6",
      isScrolled 
        ? "bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm py-3 border-b" 
        : "bg-white/50 dark:bg-black/50 backdrop-blur-sm py-5"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section: Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="relative flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            <Sun className="h-4 w-4 text-white absolute" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
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
                  "relative h-10 px-3 text-xs font-semibold uppercase tracking-wider transition-all duration-300",
                  pathname === item.href ? "text-primary" : "text-foreground/70 hover:text-secondary"
                )}
              >
                {item.label}
                {pathname === item.href ? (
                  <motion.div 
                    layoutId="activeNav" 
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" 
                  />
                ) : (
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-secondary group-hover:w-full group-hover:left-0 transition-all" />
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full hover:bg-muted text-foreground/70"
            title="System Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-secondary rounded-full border-2 border-background" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="h-10 w-10 rounded-full hover:bg-muted text-foreground/70"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <AnimatePresence mode="wait">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="h-10 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-full shadow-lg shadow-primary/20 text-xs uppercase tracking-widest"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div key="user-profile" className="flex items-center gap-3">
                <div 
                  onClick={handleLogout}
                  className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all group relative"
                >
                  <span className="group-hover:opacity-0 transition-opacity">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </span>
                  <LogIn className="absolute inset-0 m-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity rotate-180" />
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
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                    <Sun className="h-4 w-4 text-white absolute" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">HeatGuard AI</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4 gap-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-4 h-14 rounded-xl text-sm font-semibold",
                        pathname === item.href ? "bg-primary/5 text-primary" : "text-foreground/70"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                      <ChevronRight className="ml-auto h-4 w-4 opacity-30" />
                    </Button>
                  </Link>
                ))}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-muted/30 border-t space-y-4">
                <div className="flex flex-col gap-2">
                  {!user ? (
                    <>
                      <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full h-12 rounded-xl text-xs font-bold uppercase">Sign In</Button>
                      </Link>
                      <Link href="/signup" className="w-full">
                        <Button className="w-full h-12 rounded-xl bg-primary text-white text-xs font-bold uppercase">Sign Up</Button>
                      </Link>
                    </>
                  ) : (
                    <Button onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl text-xs font-bold uppercase">Sign Out</Button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme} className="h-10 gap-2 rounded-xl text-xs font-bold uppercase">
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    Theme
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}