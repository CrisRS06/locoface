'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Download, CheckCircle, Loader2, Clock, AlertCircle, Mail, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Meta Pixel type declaration
declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: object) => void;
  }
}

type PageStatus = 'loading' | 'processing' | 'success' | 'invalid';

export default function StarterPackSuccessPage() {
  const searchParams = useSearchParams();
  const packId = searchParams.get('packId');
  const [status, setStatus] = useState<PageStatus>('loading');
  const [hdUrl, setHdUrl] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 30; // 30 attempts * 2 seconds = 60 seconds max wait

  const checkPackStatus = useCallback(async () => {
    if (!packId) {
      setStatus('invalid');
      return false;
    }

    const { data: pack, error } = await supabase
      .from('credit_packs')
      .select('status, hd_base64')
      .eq('id', packId)
      .single();

    if (error || !pack) {
      setStatus('invalid');
      return false;
    }

    if (pack.status === 'paid' && pack.hd_base64) {
      setHdUrl(pack.hd_base64);
      setStatus('success');

      // Meta Pixel - Track Purchase event
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: 9.99,
          currency: 'USD',
          content_type: 'product',
          content_name: 'Starter Pack - 10 Stickers',
          num_items: 10,
        });
      }
      return true;
    }

    // Still processing (webhook not done yet)
    setStatus('processing');
    return false;
  }, [packId]);

  // Initial check and polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const startPolling = async () => {
      const isComplete = await checkPackStatus();

      if (!isComplete && pollCount < MAX_POLLS) {
        pollInterval = setTimeout(() => {
          setPollCount((prev) => prev + 1);
        }, 2000); // Poll every 2 seconds
      }
    };

    startPolling();

    return () => {
      if (pollInterval) clearTimeout(pollInterval);
    };
  }, [checkPackStatus, pollCount]);

  const handleDownload = async () => {
    if (!hdUrl) return;

    // Try Web Share API first (works best on mobile)
    try {
      if (navigator.share && 'canShare' in navigator) {
        const response = await fetch(hdUrl);
        const blob = await response.blob();
        const file = new File([blob], 'locoface-sticker.png', { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My LocoFace Sticker',
          });
          return;
        }
      }
    } catch {
      // Share cancelled or unavailable, fall through to download
    }

    // Fallback: standard download
    const link = document.createElement('a');
    link.href = hdUrl;
    link.download = `locoface-sticker-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg-soft">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-coral animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your Starter Pack...</p>
        </motion.div>
      </div>
    );
  }

  // Processing state (waiting for webhook)
  if (status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg-soft p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full text-center"
        >
          <div className="mx-auto w-16 h-16 bg-lavender/20 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-lavender animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Activating Your Pack...</h1>
          <p className="text-slate-600 mb-6">
            Your payment is being confirmed. This usually takes just a few seconds.
          </p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-5 h-5 text-coral animate-spin" />
            <span className="text-sm text-slate-500">
              Attempt {pollCount + 1} of {MAX_POLLS}
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-coral to-lavender"
              initial={{ width: '0%' }}
              animate={{ width: `${((pollCount + 1) / MAX_POLLS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Don't close this page. Your sticker will appear automatically.
          </p>
        </motion.div>
      </div>
    );
  }

  // Invalid state
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg-soft p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full text-center"
        >
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Link Invalid
          </h1>
          <p className="text-slate-600 mb-6">
            This link is not valid. Please check your email or contact support.
          </p>

          <Link href="/">
            <Button className="w-full">Create a New Sticker</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Success state - show HD sticker and confirmation
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
            Starter Pack Activated!
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Your first sticker is ready to download
          </p>
        </motion.div>

        {/* HD Sticker Preview */}
        {hdUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-lavender/10 to-coral/10 border-2 border-white/50 shadow-inner"
          >
            <img src={hdUrl} alt="HD Sticker" className="w-full h-full object-contain p-4" />
          </motion.div>
        )}

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleDownload}
            variant="coral"
            glow
            size="lg"
            className="w-full"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Sticker
          </Button>
        </motion.div>

        {/* Email notification */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-lavender/10 border border-lavender/30 rounded-2xl p-5 mt-6"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-lavender/20 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-lavender" />
            </div>
            <span className="font-semibold text-slate-800">Check Your Email</span>
          </div>
          <p className="text-sm text-slate-600">
            We sent your <strong>9 bonus codes</strong> to your email. Use them anytime to unlock more stickers!
          </p>
        </motion.div>

        {/* What's included */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-left mt-6"
        >
          <h3 className="font-semibold text-slate-800 mb-3 text-center">What You Got:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span>1 HD sticker unlocked (above)</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4 text-coral" />
              <span>9 promo codes sent to your email</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <Sparkles className="w-4 h-4 text-coral" />
              <span>Codes never expire - use anytime</span>
            </li>
          </ul>
        </motion.div>

        {/* Create Another */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 pt-6 border-t border-slate-200"
        >
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Create Another Sticker
            </Button>
          </Link>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-slate-400 mt-4"
        >
          Didn't receive the email? Check your spam folder or contact support.
        </motion.p>
      </motion.div>
    </div>
  );
}
