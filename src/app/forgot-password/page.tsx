"use client";

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/login">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border border-border hover:bg-muted/80 transition-colors">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </div>
            </Link>
          </div>

          <h1 className="text-xl font-black tracking-tighter uppercase text-foreground mb-2">Forgot <span className="text-primary">Password</span></h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-relaxed mb-8">
            Enter the email address registered with your account. We'll send you a link to reset your password.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                <Input
                  type="email"
                  required
                  className="h-12 bg-muted/30 border-transparent rounded-2xl px-4 focus:bg-background focus:border-primary transition-all text-foreground text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition-all mt-2"
              >
                {isLoading ? "Sending..." : "Submit Request"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="h-14 w-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black uppercase text-foreground mb-2 tracking-tight">Check your email</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-6 leading-relaxed">
                We've sent password reset instructions to your email.
              </p>
              <Link href="/login">
                <Button variant="outline" className="h-11 rounded-xl border-border text-foreground font-black uppercase tracking-widest px-6 text-[10px]">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Remembered? <Link href="/login" className="text-primary font-bold hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
