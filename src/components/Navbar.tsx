"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { 
  Shield, 
  Menu, 
  Sun, 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Home,
  ChevronRight,
  Moon,
  LogIn,
  MapPin,
  History,
  Sparkles,
  Info,
  Activity,
  Bell
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
import { AuthModals } from './auth/AuthModals';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

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
    { label: 'Monitor', href: '/monitor', icon: Activity },
    { label: 'Contacts', href: '/contacts', icon: Users },
    { label: 'History', href: '/alerts', icon: History },
    { label: 'Tips', href: '/tips', icon: Sparkles },
    { label: 'About', href: '/about', icon: Info },
  ];

  const authRoutes = ['/login', '/signup'];
  const isAuthPage = authRoutes.includes(pathname);

  if (isAuthPage) return null;

  return (
    <>
      <nav className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-300 px-4 md:px-6 border-b",
        isScrolled 
          ? "bg-white/95 dark:bg-black/95 shadow-sm py-2" 
          : "bg-white/80 dark:bg-black/80 py-4"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
              <Sun className="h-3.5 w-3.5 text-white absolute" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900 hidden sm:inline-block">
              HEATGUARD <span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "relative h-9 px-3 text-[10px] font-black uppercase tracking-widest transition-all",
                    pathname === item.href ? "text-primary" : "text-slate-500 hover:text-primary"
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

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full text-slate-400"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <AnimatePresence mode="wait">
              {!user ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setAuthMode('login')}
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => setAuthMode('signup')}
                    className="bg-primary hover:bg-primary/90 text-white font-black h-9 px-5 rounded-xl shadow-lg shadow-primary/10 text-[10px] uppercase tracking-widest"
                  >
                    Signup
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <button className="h-9 w-9 rounded-full bg-slate-50 border flex items-center justify-center text-slate-400 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-destructive rounded-full" />
                  </button>
                  <div 
                    onClick={handleLogout}
                    className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black cursor-pointer hover:bg-primary hover:text-white transition-all text-xs"
                  >
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                </div>
              )}
            </AnimatePresence>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-[300px] p-0 border-l">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <span className="text-xl font-black tracking-tighter">HEATGUARD AI</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 gap-1">
                  {menuItems.map((item) => (
                    <Link key={item.label} href={item.href}>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest",
                          pathname === item.href ? "bg-primary/5 text-primary" : "text-slate-500"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        <ChevronRight className="ml-auto h-3 w-3 opacity-30" />
                      </Button>
                    </Link>
                  ))}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-50 border-t">
                  {!user ? (
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => setAuthMode('login')} variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">Login</Button>
                      <Button onClick={() => setAuthMode('signup')} className="w-full h-12 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest">Signup</Button>
                    </div>
                  ) : (
                    <Button onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">Logout</Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <AuthModals 
        mode={authMode} 
        onClose={() => setAuthMode(null)} 
        onSwitch={(mode) => setAuthMode(mode)} 
      />
    </>
  );
}