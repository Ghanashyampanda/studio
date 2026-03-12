"use client";

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Login</h1>
            <div className="w-10" />
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-14 rounded-2xl bg-white border-gray-200 text-gray-900 font-bold hover:bg-gray-50 flex items-center justify-center gap-3 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-500 font-bold uppercase tracking-wider">or sign in with</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
              <Input
                type="email"
                required
                className="h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-[#2563EB] transition-all placeholder:text-gray-400 text-gray-900"
                placeholder="Rhebek@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" title="Recover Password" className="text-xs font-bold text-[#2563EB] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-14 bg-gray-50 border-transparent rounded-2xl px-5 pr-12 focus:bg-white focus:border-[#2563EB] transition-all placeholder:text-gray-400 text-gray-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] bg-orange-50 p-3 rounded-xl border border-orange-100"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}

            <div className="flex items-center space-x-2 py-1 ml-1">
              <Checkbox id="remember" className="rounded-md border-gray-300 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]" />
              <label htmlFor="remember" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all mt-4"
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-gray-700">
            Don't have an Account? <Link href="/signup" className="text-[#2563EB] font-bold hover:underline">Sign up here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
