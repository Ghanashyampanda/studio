"use client";

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, UserPlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const background = PlaceHolderImages.find(img => img.id === 'sky-background');

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

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: formData.email,
        displayName: formData.fullName,
        dateCreated: new Date().toISOString(),
        phoneNumber: formData.phone
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

      router.push('/dashboard');
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

  const passwordStrength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
  const strengthText = ["", "Weak", "Medium", "Strong"];
  const strengthColor = ["bg-black/5", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-sky-50">
      {/* Background Image */}
      {background?.imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={background.imageUrl}
            alt="Sky background"
            fill
            className="object-cover"
            priority
            data-ai-hint={background.imageHint}
          />
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
        <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-black">HeatGuard AI</span>
      </div>

      {/* Floating Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[500px]"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-black/5 border border-white/50 p-8 md:p-10 flex flex-col items-center">
          
          {/* Top Icon */}
          <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-black/5 flex items-center justify-center mb-6">
            <UserPlus className="h-7 w-7 text-black/70" />
          </div>

          <h1 className="text-2xl font-bold text-black/90 mb-2">Create an account</h1>
          <p className="text-sm text-black/40 text-center mb-8 px-4">
            Initialize your secure health profile for real-time monitoring.
          </p>

          <form onSubmit={handleSignup} className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <Input
                  name="fullName"
                  required
                  className="h-12 pl-11 bg-black/5 border-none rounded-xl placeholder:text-black/30 text-black"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <Input
                  name="phone"
                  required
                  className="h-12 pl-11 bg-black/5 border-none rounded-xl placeholder:text-black/30 text-black"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
              <Input
                name="email"
                type="email"
                required
                className="h-12 pl-11 bg-black/5 border-none rounded-xl placeholder:text-black/30 text-black"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 pl-11 bg-black/5 border-none rounded-xl placeholder:text-black/30 text-black"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <Input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 pl-11 bg-black/5 border-none rounded-xl placeholder:text-black/30 text-black"
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.password && (
              <div className="space-y-2 px-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-black/40">
                  <span>Strength</span>
                  <span className={passwordStrength === 3 ? 'text-emerald-600' : ''}>{strengthText[passwordStrength]}</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strengthColor[passwordStrength]}`} 
                    style={{ width: `${(passwordStrength / 3) * 100}%` }} 
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 py-2">
              <Checkbox id="terms" required className="rounded-md border-black/10 data-[state=checked]:bg-black data-[state=checked]:text-white" />
              <label htmlFor="terms" className="text-[10px] font-bold text-black/40 uppercase tracking-widest cursor-pointer select-none">
                I accept the <Link href="#" className="text-black hover:underline">Medical Privacy Protocol</Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#1a1a1a] hover:bg-black text-white font-bold transition-all mt-2"
            >
              {isLoading ? "Provisioning..." : "Initialize Profile"}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/5 border-dashed" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-transparent px-4 text-black/30">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                className="h-12 rounded-xl bg-white border-black/5 shadow-sm hover:bg-gray-50 flex items-center justify-center p-0"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl bg-white border-black/5 shadow-sm hover:bg-gray-50 flex items-center justify-center p-0"
              >
                <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl bg-white border-black/5 shadow-sm hover:bg-gray-50 flex items-center justify-center p-0"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.96.95-2.06 1.94-3.3 1.94-1.22 0-1.61-.75-3.07-.75-1.47 0-1.91.73-3.07.75-1.19.02-2.31-1.01-3.33-2.02-2.08-2.06-3.67-5.83-3.67-9.35 0-3.5 1.76-5.34 3.42-5.34 1.14 0 2.21.79 2.91.79.69 0 2-.96 3.41-.81 1.48.06 2.61.6 3.4 1.75-3.04 1.83-2.55 5.86.48 7.37-1.14 1.63-2.58 3.29-4.28 4.71zM11.53 4.22c.62-.75 1.04-1.79.92-2.83-1.04.04-2.3.69-3.05 1.56-.66.75-1.24 1.82-1.12 2.83 1.14.09 2.31-.62 3.25-1.56z" />
                </svg>
              </Button>
            </div>
          </form>

          <p className="mt-8 text-xs font-bold text-black/40">
            Already a member? <Link href="/login" className="text-black hover:underline transition-all">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
