"use client";

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Shield, Sun } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const illustration = PlaceHolderImages.find(img => img.id === 'login-illustration');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8 pt-24">
      <Card className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-[#F5F7FA]">
        {/* Left Side: Illustration */}
        <div className="relative hidden lg:block bg-primary/5">
          <Image
            src={illustration?.imageUrl || ''}
            alt={illustration?.description || 'Login'}
            fill
            className="object-cover opacity-90 mix-blend-multiply"
            data-ai-hint={illustration?.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none mb-4">
              Precision <br /><span className="text-secondary">Surveillance</span>
            </h2>
            <p className="font-medium text-sm opacity-90 max-w-xs uppercase tracking-widest">
              Advanced biometric monitoring for thermal safety.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <CardContent className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground uppercase">
                HeatGuard <span className="text-primary">AI</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Welcome Back</h1>
            <p className="text-muted-foreground text-sm font-medium mt-2">Access your thermal health dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  required
                  className="h-12 pl-12 bg-muted/30 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-12 pl-12 pr-12 bg-muted/30 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary" />
              <label htmlFor="remember" className="text-xs font-bold text-muted-foreground uppercase tracking-widest cursor-pointer select-none">Remember this device</label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-white px-4 text-muted-foreground">Or Protocol Login</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-14 rounded-2xl border-muted-foreground/20 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-muted transition-all"
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

          <p className="mt-10 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Don't have an account? <Link href="/signup" className="text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline">Sign Up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}