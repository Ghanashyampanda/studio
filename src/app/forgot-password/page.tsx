
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
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <Link href="/login">
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </div>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#1F2937] mb-3 leading-tight">Forgot Password</h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-10">
            Enter the email address registered with your account. We'll send you a link to reset your password.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    className="h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-[#2563EB] transition-all"
                    placeholder="Rhebek@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all mt-4"
              >
                {isLoading ? "Sending..." : "Submit"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="h-16 w-16 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Check your email</h3>
              <p className="text-sm text-gray-500 font-medium mb-8">
                We've sent password reset instructions to your email.
              </p>
              <Link href="/login">
                <Button variant="outline" className="h-12 rounded-xl border-gray-200 text-gray-700 font-bold px-8">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-400">
              Remembered password? <Link href="/login" className="text-[#2563EB] font-bold hover:underline">Login to your account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
