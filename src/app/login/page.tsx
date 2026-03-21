"use client";

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError("Incorrect email or password. Please try again.");
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Ensure user profile and settings exist upon Google login
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        dateCreated: new Date().toISOString()
      }, { merge: true });

      await setDoc(doc(db, 'users', user.uid, 'user_settings', 'current'), {
        id: 'current',
        userId: user.uid,
        maxBodyTemperatureThresholdC: 39.5,
        maxHeartRateThresholdBPM: 80, // UPDATED TO 80 BPM LIMIT
        minHeartRateThresholdBPM: 50,
        notificationSensitivity: 'medium',
        enableAutomatedAlerts: true,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message || "Could not complete Google Sign-In."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-card rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden border border-border"
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border border-border hover:bg-muted/80 transition-colors">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </div>
            </Link>
            <h1 className="text-lg font-bold text-foreground">Login</h1>
            <div className="w-9" />
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-2xl bg-card border-border text-foreground font-bold hover:bg-muted flex items-center justify-center gap-3 transition-all text-sm"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">or sign in with</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
              <Input
                type="email"
                required
                className="h-12 bg-muted/30 border-transparent rounded-2xl px-4 focus:bg-background focus:border-primary transition-all placeholder:text-muted-foreground text-foreground text-sm"
                placeholder="Rhebek@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" title="Recover Password" className="text-[10px] font-bold text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 bg-muted/30 border-transparent rounded-2xl px-4 pr-10 focus:bg-background focus:border-primary transition-all placeholder:text-muted-foreground text-foreground text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-[10px] font-bold text-secondary bg-secondary/10 p-2.5 rounded-xl border border-secondary/20"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </motion.div>
            )}

            <div className="flex items-center space-x-2 py-0.5 ml-1">
              <Checkbox id="remember" className="h-3.5 w-3.5 rounded-sm border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label htmlFor="remember" className="text-[10px] font-bold text-muted-foreground cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition-all mt-2"
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs font-bold text-muted-foreground">
            Don't have an Account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
