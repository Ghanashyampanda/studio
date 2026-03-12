"use client";

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords mismatch", description: "Confirmation must match password." });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.fullName });
      
      // Initialize basic Firestore data
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: formData.email,
        displayName: formData.fullName,
        dateCreated: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), {
        id: 'preferences',
        userId: user.uid,
        maxBodyTemperatureThresholdC: 39.5,
        maxHeartRateThresholdBPM: 140,
        minHeartRateThresholdBPM: 50,
        notificationSensitivity: 'medium',
        enableAutomatedAlerts: true,
        lastUpdated: new Date().toISOString()
      });

      // Send verification
      await sendEmailVerification(user);
      
      router.push('/verify-email');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Account Creation Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        dateCreated: new Date().toISOString()
      }, { merge: true });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-Up Failed",
        description: error.message
      });
    }
  };

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length > 6) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </div>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Signup</h1>
            <div className="w-9" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full h-12 rounded-2xl bg-white border-gray-200 text-gray-900 font-bold hover:bg-gray-50 flex items-center justify-center gap-3 transition-all text-sm"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-500 font-bold uppercase tracking-wider text-[10px]">or sign up with</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Full Name</label>
              <Input
                name="fullName"
                required
                className="h-12 bg-gray-50 border-transparent rounded-2xl px-4 focus:bg-white focus:border-[#2563EB] transition-all text-gray-900 text-sm"
                placeholder="Becca Ade"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
              <Input
                name="email"
                type="email"
                required
                className="h-12 bg-gray-50 border-transparent rounded-2xl px-4 focus:bg-white focus:border-[#2563EB] transition-all text-gray-900 text-sm"
                placeholder="Rhebek@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 bg-gray-50 border-transparent rounded-2xl px-4 pr-10 focus:bg-white focus:border-[#2563EB] transition-all text-gray-900 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1 h-0.5 w-full rounded-full overflow-hidden bg-gray-100">
                    <div className={`h-full transition-all duration-300 ${strength > 25 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${strength}%` }} />
                  </div>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                    Strength: {strength < 50 ? 'Weak' : strength < 100 ? 'Fair' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 bg-gray-50 border-transparent rounded-2xl px-4 pr-10 focus:bg-white focus:border-[#2563EB] transition-all text-gray-900 text-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 py-1 ml-1">
              <Checkbox id="terms" required className="mt-0.5 h-3.5 w-3.5 rounded-sm border-gray-300 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]" />
              <label htmlFor="terms" className="text-[9px] font-bold text-gray-700 leading-tight select-none">
                By Creating an Account, I accept HeatGuard AI <Link href="#" className="text-[#2563EB] hover:underline">Terms of Use</Link> and <Link href="#" className="text-[#2563EB] hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all mt-2"
            >
              {isLoading ? "Signing up..." : "Signup"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs font-bold text-gray-700">
            Have an Account? <Link href="/login" className="text-[#2563EB] font-bold hover:underline">Sign in here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
