"use client";

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

  const illustration = PlaceHolderImages.find(img => img.id === 'signup-illustration');

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

      // Update profile
      await updateProfile(user, { displayName: formData.fullName });

      // Create user document
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: formData.email,
        displayName: formData.fullName,
        dateCreated: new Date().toISOString(),
        phoneNumber: formData.phone
      });

      // Default settings
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
  const strengthColor = ["bg-muted", "bg-destructive", "bg-secondary", "bg-emerald-500"];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8 pt-24">
      <Card className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-[#F5F7FA]">
        {/* Left Side: Illustration */}
        <div className="relative hidden lg:block bg-primary/5">
          <Image
            src={illustration?.imageUrl || ''}
            alt={illustration?.description || 'Signup'}
            fill
            className="object-cover opacity-90 mix-blend-multiply"
            data-ai-hint={illustration?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none mb-4">
              Autonomous <br /><span className="text-secondary">Protection</span>
            </h2>
            <p className="font-medium text-sm opacity-90 max-w-xs uppercase tracking-widest">
              Join the elite network of intelligent thermal safety monitoring.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <CardContent className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground uppercase">
                HeatGuard <span className="text-primary">AI</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Initialize Node</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Create your secure medical profile</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input name="fullName" required className="h-11 pl-11 bg-muted/30 border-none rounded-xl" placeholder="John Doe" value={formData.fullName} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Node</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input name="phone" required className="h-11 pl-11 bg-muted/30 border-none rounded-xl" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Identifier</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input name="email" type="email" required className="h-11 pl-11 bg-muted/30 border-none rounded-xl" placeholder="name@company.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Key</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input name="password" type={showPassword ? "text" : "password"} required className="h-11 pl-11 bg-muted/30 border-none rounded-xl" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verify Key</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input name="confirmPassword" type={showPassword ? "text" : "password"} required className="h-11 pl-11 bg-muted/30 border-none rounded-xl" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>
            </div>

            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Strength</span>
                  <span className={strengthText[passwordStrength] === 'Strong' ? 'text-emerald-500' : ''}>{strengthText[passwordStrength]}</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthColor[passwordStrength]}`} style={{ width: `${(passwordStrength / 3) * 100}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 py-2">
              <Checkbox id="terms" required className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary" />
              <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer select-none">
                Accept <Link href="#" className="text-primary hover:text-secondary transition-colors underline-offset-4 underline">Medical Data Consent Protocol</Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? "Provisioning..." : "Initialize Profile"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-white px-4 text-muted-foreground">Or Protocol Registration</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="w-full h-12 rounded-2xl border-muted-foreground/20 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-muted transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google Workspace
            </Button>
          </form>

          <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}