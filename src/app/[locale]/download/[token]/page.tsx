'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Download, CheckCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Meta Pixel type declaration
declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: object) => void;
  }
}

type PageStatus = 'loading' | 'processing' | 'valid' | 'invalid' | 'expired';

export default function DownloadPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<PageStatus>('loading');
  const [hdUrl, setHdUrl] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 30; // 30 attempts * 2 seconds = 60 seconds max wait

  const checkOrderStatus = useCallback(async () => {
    if (!token) {
      setStatus('invalid');
      return false;
    }

    // First try to find by order ID (from redirect)
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, hd_base64, download_token, download_expires_at')
      .eq('id', token)
      .single();

    // If not found by ID, try by download_token (legacy links)
    if (error || !order) {
      const { data: orderByToken } = await supabase
        .from('orders')
        .select('id, status, hd_base64, download_token, download_expires_at')
        .eq('download_token', token)
        .single();

      if (!orderByToken) {
        setStatus('invalid');
        return false;
      }

      // Check expiration for token-based access
      if (orderByToken.download_expires_at && new Date(orderByToken.download_expires_at) < new Date()) {
        setStatus('expired');
        return false;
      }

      if (orderByToken.status === 'paid' && orderByToken.hd_base64) {
        setHdUrl(orderByToken.hd_base64);
        setStatus('valid');
        return true;
      }

      // Still processing
      setStatus('processing');
      return false;
    }

    // Order found by ID
    if (order.status === 'paid' && order.hd_base64) {
      setHdUrl(order.hd_base64);
      setStatus('valid');

      // Meta Pixel - Track Purchase event (only once per order to prevent duplicates)
      const purchaseKey = `fbq_purchase_${token}`;
      if (typeof window !== 'undefined' && window.fbq && !sessionStorage.getItem(purchaseKey)) {
        window.fbq('track', 'Purchase', {
          value: 1.99,
          currency: 'USD',
          content_type: 'product',
          content_name: 'HD Sticker',
        });
        sessionStorage.setItem(purchaseKey, 'true');
      }
      return true;
    }

    // Order exists but not yet paid (webhook still processing)
    if (order.status === 'pending') {
      setStatus('processing');
      return false;
    }

    // Unknown status
    setStatus('invalid');
    return false;
  }, [token]);

  // Initial check and polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const startPolling = async () => {
      const isComplete = await checkOrderStatus();

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
  }, [checkOrderStatus, pollCount]);

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
          <p className="text-slate-600">Loading your sticker...</p>
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

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Processing Payment...</h1>
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
            Don't close this page. We'll show your sticker automatically.
          </p>
        </motion.div>
      </div>
    );
  }

  // Invalid or expired state
  if (status === 'invalid' || status === 'expired') {
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
            {status === 'expired' ? 'Link Expired' : 'Link Invalid'}
          </h1>
          <p className="text-slate-600 mb-6">
            {status === 'expired'
              ? 'This download link has expired. Download links are valid for 24 hours.'
              : 'This download link is not valid. Please check your email or contact support.'}
          </p>

          <Link href="/">
            <Button className="w-full">Create a New Sticker</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Valid state - show download
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg-soft p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-lavender opacity-50 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-soft-pink opacity-40 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-coral opacity-30 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
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

        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-slate-600 mb-6">
          Your HD sticker is ready. It's watermark-free and high resolution.
        </p>

        {hdUrl && (
          <div className="mb-6 relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-lavender/10 to-coral/10 border-2 border-white/50 shadow-inner">
            <img src={hdUrl} alt="HD Sticker" className="w-full h-full object-contain p-4" />
          </div>
        )}

        <Button
          onClick={handleDownload}
          variant="coral"
          glow
          size="lg"
          className="w-full"
        >
          <Download className="mr-2 h-5 w-5" />
          Save Sticker
        </Button>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Create Another Sticker
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
