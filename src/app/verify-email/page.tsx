"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, RefreshCcw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleResend = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsResending(false), 10000); 
    }
  };

  const handleCheckStatus = async () => {
    if (!user) return;
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/signup">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border border-border hover:bg-muted/80 transition-colors">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </div>
            </Link>
          </div>

          <div className="text-center space-y-4 mb-8">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">Verify <span className="text-primary">Email</span></h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
              We've sent a verification link to <br />
              <span className="text-foreground">{user?.email || "your address"}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all"
            >
              {checking ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              I've Verified My Email
            </Button>

            <div className="text-center pt-2">
              <button 
                onClick={handleResend} 
                disabled={isResending} 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline disabled:text-muted-foreground transition-colors"
              >
                {isResending ? "Link Resent (Wait 10s)" : "Resend Verification Link"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
