'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Mail, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Meta Pixel type declaration
declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: object) => void;
  }
}

export default function ThankYouPage() {
  // Track purchase on page load
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: 9.99,
      currency: 'USD',
      content_type: 'product',
      content_name: 'Starter Pack - 10 Stickers',
      num_items: 10,
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg-soft p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-lavender opacity-50 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-soft-pink opacity-40 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-mint-green opacity-30 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full text-center relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/logo-full.png" alt="LocoFace" width={100} height={100} />
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-mint-green/30 rounded-full flex items-center justify-center mb-6 shadow-lg"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Thank You! 🎉
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Your Starter Pack is on its way!
          </p>
        </motion.div>

        {/* Email notification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-lavender/10 border border-lavender/30 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-lavender/20 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-lavender" />
            </div>
            <span className="font-semibold text-slate-800">Check Your Email</span>
          </div>
          <p className="text-sm text-slate-600">
            We're sending your <strong>10 promo codes</strong> to your email right now.
            They should arrive within the next few minutes.
          </p>
        </motion.div>

        {/* What's included */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-left mb-6"
        >
          <h3 className="font-semibold text-slate-800 mb-3 text-center">What You Got:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4 text-coral" />
              <span>10 unique promo codes for HD stickers</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4 text-coral" />
              <span>Each code unlocks one full-resolution sticker</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4 text-coral" />
              <span>Codes never expire - use them anytime</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4 text-coral" />
              <span>Share with friends or keep them all!</span>
            </li>
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/">
            <Button variant="coral" glow size="lg" className="w-full">
              Create Your First Sticker
            </Button>
          </Link>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-slate-400 mt-4"
        >
          Didn't receive the email? Check your spam folder or contact support.
        </motion.p>
      </motion.div>
    </div>
  );
}
