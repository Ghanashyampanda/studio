"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleResend = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsResending(false), 30000); // 30s cooldown
    }
  };

  const handleVerify = () => {
    if (user) {
      user.reload().then(() => {
        if (user.emailVerified) {
          router.push('/dashboard');
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/signup">
              <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </div>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">Please verify your email address</h1>
          <p className="text-xs text-gray-700 font-bold leading-relaxed mb-8">
            We've sent an email to <span className="font-bold text-gray-900">{user?.email || "your email"}</span>, please enter the code below.
          </p>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Enter Code</label>
              <div className="flex justify-between gap-1.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-10 h-12 bg-gray-50 border-2 border-transparent rounded-xl text-center text-lg font-bold text-gray-900 focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
            >
              Verify Code
            </Button>

            <p className="text-center text-xs font-bold text-gray-700">
              Didn't see your email? <button onClick={handleResend} disabled={isResending} className="text-[#2563EB] font-bold hover:underline">
                {isResending ? "Resending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
