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
        className="w-full max-w-[400px] bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/login">
              <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </div>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">Forgot Password</h1>
          <p className="text-xs text-gray-700 font-bold leading-relaxed mb-8">
            Enter the email address registered with your account. We'll send you a link to reset your password.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    className="h-12 bg-gray-50 border-transparent rounded-2xl px-4 focus:bg-white focus:border-[#2563EB] transition-all text-gray-900 text-sm"
                    placeholder="Rhebek@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all mt-2"
              >
                {isLoading ? "Sending..." : "Submit"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="h-14 w-14 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Check your email</h3>
              <p className="text-xs text-gray-700 font-bold mb-6">
                We've sent password reset instructions to your email.
              </p>
              <Link href="/login">
                <Button variant="outline" className="h-11 rounded-xl border-gray-200 text-gray-900 font-bold px-6 text-sm">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs font-bold text-gray-700">
              Remembered password? <Link href="/login" className="text-[#2563EB] font-bold hover:underline">Login to your account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
