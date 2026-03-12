
"use client";

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile,
  sendEmailVerification 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalsProps {
  mode: 'login' | 'signup' | null;
  onClose: () => void;
  onSwitch: (newMode: 'login' | 'signup') => void;
}

export function AuthModals({ mode, onClose, onSwitch }: AuthModalsProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
        maxHeartRateThresholdBPM: 140,
        minHeartRateThresholdBPM: 50,
        notificationSensitivity: 'medium',
        enableAutomatedAlerts: true,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      onClose();
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
      router.push('/dashboard');
    } catch (err: any) {
      setError("Incorrect email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email,
        displayName: fullName,
        dateCreated: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', user.uid, 'user_settings', 'current'), {
        id: 'current',
        userId: user.uid,
        maxBodyTemperatureThresholdC: 39.5,
        maxHeartRateThresholdBPM: 140,
        minHeartRateThresholdBPM: 50,
        notificationSensitivity: 'medium',
        enableAutomatedAlerts: true,
        lastUpdated: new Date().toISOString()
      });

      await sendEmailVerification(user);
      onClose();
      router.push('/verify-email');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!mode} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl bg-white">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-gray-900 text-center uppercase tracking-tight">
              {mode === 'login' ? 'Login' : 'Signup'}
            </DialogTitle>
          </DialogHeader>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-2xl bg-white border-gray-200 text-gray-900 font-bold hover:bg-gray-50 flex items-center justify-center gap-3 transition-all text-sm"
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
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-white px-3 text-gray-400 font-bold uppercase tracking-widest">or continue with</span>
            </div>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Full Name</label>
                <Input
                  required
                  className="h-11 bg-gray-50 border-transparent rounded-2xl px-4 focus:bg-white focus:border-[#2563EB] transition-all text-sm"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
              <Input
                type="email"
                required
                className="h-11 bg-gray-50 border-transparent rounded-2xl px-4 focus:bg-white focus:border-[#2563EB] transition-all text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => router.push('/forgot-password')} className="text-[10px] font-bold text-[#2563EB] hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-11 bg-gray-50 border-transparent rounded-2xl px-4 pr-10 focus:bg-white focus:border-[#2563EB] transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF6B35] bg-orange-50 p-2 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all mt-2"
            >
              {isLoading ? "Processing..." : mode === 'login' ? "Login" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs font-bold text-gray-700">
            {mode === 'login' ? (
              <>Don't have an Account? <button onClick={() => onSwitch('signup')} className="text-[#2563EB] font-bold hover:underline">Sign up here</button></>
            ) : (
              <>Have an Account? <button onClick={() => onSwitch('login')} className="text-[#2563EB] font-bold hover:underline">Sign in here</button></>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
