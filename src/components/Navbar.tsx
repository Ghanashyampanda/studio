"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { 
  Shield, 
  Menu, 
  Sun, 
  LayoutDashboard, 
  Users, 
  Home,
  ChevronRight,
  Moon,
  MapPin,
  History,
  Sparkles,
  Info,
  Activity,
  Bell,
  LogOut,
  Settings,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  const menuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Monitor', href: '/monitor', icon: Activity },
    { label: 'Location', href: '/location', icon: MapPin },
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
          ? "bg-background/95 shadow-sm py-2" 
          : "bg-background/80 py-4"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
              <Sun className="h-3.5 w-3.5 text-primary-foreground absolute" />
            </div>
            <span className="text-lg font-black tracking-tighter text-foreground hidden sm:inline-block">
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
                    pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
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
              className="h-9 w-9 rounded-full text-muted-foreground"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <AnimatePresence mode="wait">
              {!user ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setAuthMode('login')}
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => setAuthMode('signup')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-9 px-5 rounded-xl shadow-lg shadow-primary/10 text-[10px] uppercase tracking-widest"
                  >
                    Signup
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <button className="h-9 w-9 rounded-full bg-muted border flex items-center justify-center text-muted-foreground relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-destructive rounded-full" />
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all text-xs">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 bg-background border border-border shadow-2xl z-[110]">
                      <DropdownMenuLabel className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Authenticated Node</span>
                          <span className="text-xs font-black text-foreground truncate">{user.displayName || 'Active User'}</span>
                          <span className="text-[10px] font-bold text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border mx-2" />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-xl hover:bg-muted transition-colors">
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Command Center</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/monitor" className="flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-xl hover:bg-muted transition-colors">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Live Telemetry</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-xl hover:bg-muted transition-colors">
                          <Settings className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Account Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border mx-2" />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">LogOut Session</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </AnimatePresence>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background w-[300px] p-0 border-l">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <span className="text-xl font-black tracking-tighter">HEATGUARD AI</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 gap-1">
                  {menuItems.map((item) => (
                    <Link key={item.label} href={item.href} className="w-full">
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest",
                          pathname === item.href ? "bg-primary/5 text-primary" : "text-muted-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        <ChevronRight className="ml-auto h-3 w-3 opacity-30" />
                      </Button>
                    </Link>
                  ))}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-muted/50 border-t">
                  {!user ? (
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => setAuthMode('login')} variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">Login</Button>
                      <Button onClick={() => setAuthMode('signup')} className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">Signup</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/settings" className="w-full">
                        <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">Settings</Button>
                      </Link>
                      <Button onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">Logout</Button>
                    </div>
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