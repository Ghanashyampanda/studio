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
        className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <Link href="/signup">
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </div>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">Please verify your email address</h1>
          <p className="text-sm text-gray-700 font-bold leading-relaxed mb-10">
            We've sent an email to <span className="font-bold text-gray-900">{user?.email || "your email"}</span>, please enter the code below.
          </p>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Enter Code</label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-14 bg-gray-50 border-2 border-transparent rounded-xl text-center text-xl font-bold text-gray-900 focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full h-14 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all"
            >
              Verify Code
            </Button>

            <p className="text-center text-sm font-bold text-gray-700">
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
