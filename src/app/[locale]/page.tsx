'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

// Meta Pixel type declaration
declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: object) => void;
  }
}
import {
  RefreshCw,
  Download,
  Sparkles,
  AlertCircle,
  Share2,
  Mail,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Skeleton } from '@/components/ui/Skeleton';
import { CheckoutCard } from '@/components/ui/CheckoutCard';
import { FloatingDecorations, DoodleStar, DoodleHeart } from '@/components/ui/Decorations';
import { useOnvoPay } from '@/hooks/useOnvoPay';
import { useChristmas } from '@/contexts/ChristmasContext';

// Dynamic imports for heavy components (reduces initial bundle)
const Confetti = dynamic(() => import('@/components/ui/Confetti').then(mod => mod.Confetti), {
  ssr: false,
  loading: () => null,
});

const Snowfall = dynamic(() => import('@/components/ui/Snowfall').then(mod => mod.Snowfall), {
  ssr: false,
  loading: () => null,
});

const FloatingChristmasDecorations = dynamic(
  () => import('@/components/ui/ChristmasDecorations').then(mod => mod.FloatingChristmasDecorations),
  { ssr: false, loading: () => null }
);

const Ornament = dynamic(
  () => import('@/components/ui/ChristmasDecorations').then(mod => mod.Ornament),
  { ssr: false, loading: () => null }
);

const HollyLeaf = dynamic(
  () => import('@/components/ui/ChristmasDecorations').then(mod => mod.HollyLeaf),
  { ssr: false, loading: () => null }
);

// App States
type AppState = 'hero' | 'processing' | 'checkout' | 'results';
type ProcessingStage = 'preparing' | 'generating';

export default function Home() {
  // State management
  const [appState, setAppState] = useState<AppState>('hero');
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('preparing');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Blurred preview
  const [hdUrl, setHdUrl] = useState<string | null>(null); // HD unlocked version
  const [previewId, setPreviewId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [currentPaymentIntentId, setCurrentPaymentIntentId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [isStarterPackPurchase, setIsStarterPackPurchase] = useState(false);
  const [starterPackSuccess, setStarterPackSuccess] = useState<string | null>(null);
  const [starterPackEmail, setStarterPackEmail] = useState('');

  // useRef to avoid stale closure issue with payment callbacks
  const paymentIntentIdRef = useRef<string | null>(null);
  const previewIdRef = useRef<string | undefined>(undefined);
  const isStarterPackRef = useRef<boolean>(false);
  const starterPackEmailRef = useRef<string>('');

  // Christmas mode
  const { isChristmas } = useChristmas();

  // Confirm payment with polling
  const confirmPayment = async (paymentIntentId: string, previewIdToConfirm: string) => {
    const maxAttempts = 10;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
                const response = await fetch('/api/orders/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId, previewId: previewIdToConfirm }),
        });

        const result = await response.json();

        if (result.success && result.status === 'paid' && result.hdUrl) {
          return result;
        }

        // Payment not ready yet, wait and retry
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (err) {
        console.error('Confirm attempt failed:', err);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    return null;
  };

  // Confirm starter pack payment with polling
  const confirmStarterPack = async (paymentIntentId: string, email: string) => {
    const maxAttempts = 10;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
                const response = await fetch('/api/packs/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId, email }),
        });

        const result = await response.json();

        if (result.success && result.status === 'paid') {
          return result;
        }

        // Payment not ready yet, wait and retry
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (err) {
        console.error('Confirm starter pack attempt failed:', err);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    return null;
  };

  // Onvo Pay checkout hook
  const { isReady: onvoReady, renderPaymentForm } = useOnvoPay({
    onSuccess: async () => {
      const currentPreviewId = previewIdRef.current;
      const currentPaymentId = paymentIntentIdRef.current;
      const isStarterPack = isStarterPackRef.current;

      setShowPaymentForm(false);
      setIsConfirmingPayment(true);

      // Handle Starter Pack purchase
      if (isStarterPack && currentPaymentId) {
        const email = starterPackEmailRef.current;

        if (!email || !email.includes('@')) {
          setError('Please enter a valid email to receive your codes');
          setIsConfirmingPayment(false);
          setIsBuying(false);
          return;
        }

        const result = await confirmStarterPack(currentPaymentId, email);

        if (result?.success) {
          // Meta Pixel - Track Purchase for Starter Pack
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Purchase', {
              value: 9.99,
              currency: 'USD',
              content_type: 'product',
              content_name: 'Starter Pack - 10 Stickers',
              num_items: 10,
            });
          }
          setStarterPackSuccess(`Your 10 promo codes have been sent to ${email}!`);
          setShowConfetti(true);
        } else {
          setError('Payment confirmed but failed to process your pack. Please contact support.');
        }
      }
      // Handle individual sticker purchase
      else if (currentPreviewId && currentPaymentId) {
        const result = await confirmPayment(currentPaymentId, currentPreviewId);

        if (result?.hdUrl) {
          // Meta Pixel - Track Purchase for individual sticker
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Purchase', {
              value: 1.99,
              currency: 'USD',
              content_type: 'product',
              content_name: 'HD Sticker',
              num_items: 1,
            });
          }
          setHdUrl(result.hdUrl);
          setShowConfetti(true);
          setAppState('results');
        } else {
          setError('Payment confirmed but failed to get your sticker. Please contact support.');
        }
      } else {
        setError('Payment state error. Please try again.');
      }

      setIsConfirmingPayment(false);
      setIsBuying(false);
      setCurrentPaymentIntentId(null);
      setIsStarterPackPurchase(false);
      paymentIntentIdRef.current = null;
      isStarterPackRef.current = false;
    },
    onError: (error) => {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
      setIsBuying(false);
      setShowPaymentForm(false);
      setCurrentPaymentIntentId(null);
      paymentIntentIdRef.current = null;
      setIsConfirmingPayment(false);
    },
  });

  // Process uploaded image
  const processImage = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    // Reset state and start processing
    setError(null);
    setPreviewUrl(null);
    setHdUrl(null);
    setPreviewId(undefined);
    setAppState('processing');
    setProcessingStage('preparing');

    // Show preview of original image
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      // Stage 1: Preparing (brief)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Stage 2: Generating (API call)
      setProcessingStage('generating');

      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', 'guest');
      // Pass Christmas mode to API for festive sticker generation
      if (isChristmas) {
        formData.append('mode', 'christmas');
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process image');
      }

      setPreviewUrl(data.previewUrl); // Blurred version
      setPreviewId(data.previewId);
      previewIdRef.current = data.previewId; // Also update ref for callback

      // Meta Pixel - Track ViewContent when sticker is generated
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_type: 'product',
          content_name: 'AI Sticker Preview',
          content_category: 'Sticker',
          currency: 'USD',
          value: 1.99,
        });
      }

      // Go to checkout instead of results
      setAppState('checkout');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAppState('hero');
    }
  };

  // File handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  // Purchase handler
  const handlePurchase = async () => {
    if (!previewId || !onvoReady) return;

    // Meta Pixel - Track InitiateCheckout
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_name: 'HD Sticker',
        currency: 'USD',
        value: 1.99,
        num_items: 1,
      });
    }

    setIsBuying(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId }),
      });

      const data = await response.json();

      if (data.paymentIntentId) {
        setCurrentPaymentIntentId(data.paymentIntentId);
        paymentIntentIdRef.current = data.paymentIntentId; // Also update ref for callback
        setShowPaymentForm(true);
        // Wait for the container to be rendered, then mount Onvo payment form
        setTimeout(() => {
          renderPaymentForm(data.paymentIntentId, '#onvo-payment-container');
        }, 100);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout. Please try again.');
      setIsBuying(false);
    }
  };

  // Promo code handler
  const handlePromoCode = async (code: string): Promise<boolean> => {
    if (!previewId) return false;

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, previewId }),
      });

      const data = await response.json();

      if (data.valid && data.hdUrl) {
        setHdUrl(data.hdUrl);
        setShowConfetti(true);
        setAppState('results');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Promo validation error:', err);
      return false;
    }
  };

  // Starter Pack purchase handler
  const handleStarterPackPurchase = async () => {
    if (!onvoReady) return;

    // Meta Pixel - Track InitiateCheckout for Starter Pack
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_name: 'Starter Pack - 10 Stickers',
        currency: 'USD',
        value: 9.99,
        num_items: 10,
      });
    }

    // Reset email for new purchase
    setStarterPackEmail('');
    starterPackEmailRef.current = '';

    setIsBuying(true);
    setError(null);
    setStarterPackSuccess(null); // Reset any previous success message

    try {
      const response = await fetch('/api/checkout/starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.paymentIntentId) {
        setCurrentPaymentIntentId(data.paymentIntentId);
        paymentIntentIdRef.current = data.paymentIntentId; // Also update ref for callback
        setIsStarterPackPurchase(true);
        isStarterPackRef.current = true; // Mark as starter pack for callback
        setShowPaymentForm(true);
        // Wait for the container to be rendered, then mount Onvo payment form
        setTimeout(() => {
          renderPaymentForm(data.paymentIntentId, '#onvo-payment-container');
        }, 100);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (err) {
      console.error('Starter pack checkout error:', err);
      setError('Failed to start checkout. Please try again.');
      setIsBuying(false);
    }
  };

  // Cancel payment form
  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setCurrentPaymentIntentId(null);
    paymentIntentIdRef.current = null;
    setIsBuying(false);
  };

  // Reset to create another
  const handleReset = () => {
    setPreviewUrl(null);
    setHdUrl(null);
    setPreviewId(undefined);
    setPreviewImage(null);
    setError(null);
    setShowConfetti(false);
    setAppState('hero');
    setProcessingStage('preparing');
  };

  // Download sticker with Web Share API for mobile
  const handleDownload = async () => {
    if (!hdUrl) return;

    // For base64 data URLs, convert to blob
    const isBase64 = hdUrl.startsWith('data:');

    try {
      // Try Web Share API first (works best on mobile)
      if (navigator.share && 'canShare' in navigator) {
        let file: File;

        if (isBase64) {
          // Convert base64 to blob
          const response = await fetch(hdUrl);
          const blob = await response.blob();
          file = new File([blob], 'locoface-sticker.png', { type: 'image/png' });
        } else {
          const response = await fetch(hdUrl);
          const blob = await response.blob();
          file = new File([blob], 'locoface-sticker.png', { type: 'image/png' });
        }

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My LocoFace Sticker',
          });
          return;
        }
      }
    } catch (err) {
      // User cancelled or share failed, fall through to download
      // Share cancelled or unavailable, fall through to download
    }

    // Fallback: standard download
    const link = document.createElement('a');
    link.href = hdUrl;
    link.download = 'locoface-sticker.png';
    link.click();
  };

  // Share the app with friends
  const handleShareApp = async () => {
    const shareData = {
      title: 'LocoFace - AI Sticker Maker',
      text: 'Check out LocoFace! Turn your selfies into cute chibi stickers with AI',
      url: 'https://locoface.com',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled, copy link instead
        await navigator.clipboard.writeText(shareData.url);
      }
    } else {
      // Fallback: copy link
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  return (
    <main className="min-h-screen gradient-bg-soft flex flex-col items-center overflow-hidden relative">
      {/* Confetti Celebration */}
      <Confetti trigger={showConfetti} />

      {/* Snowfall for non-hero states when Christmas mode is ON */}
      {isChristmas && appState !== 'hero' && <Snowfall />}

      {/* Background Blobs - Christmas colors when enabled */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 -left-40 w-96 h-96 rounded-full filter blur-3xl animate-blob transition-all duration-500 ${
            isChristmas
              ? 'bg-red-400 opacity-40'
              : 'bg-lavender opacity-50 mix-blend-multiply'
          }`}
        />
        <div
          className={`absolute top-40 -right-40 w-96 h-96 rounded-full filter blur-3xl animate-blob animation-delay-2000 transition-all duration-500 ${
            isChristmas
              ? 'bg-green-500 opacity-35'
              : 'bg-soft-pink opacity-50 mix-blend-multiply'
          }`}
        />
        <div
          className={`absolute bottom-40 left-20 w-96 h-96 rounded-full filter blur-3xl animate-blob animation-delay-4000 transition-all duration-500 ${
            isChristmas
              ? 'bg-yellow-400 opacity-30'
              : 'bg-coral opacity-30 mix-blend-multiply'
          }`}
        />
        {/* Extra Christmas blob */}
        {isChristmas && (
          <div className="absolute top-1/2 right-20 w-80 h-80 bg-red-300 opacity-25 rounded-full filter blur-3xl animate-blob" />
        )}
      </div>

      {/* Footer Links - Fixed position, discrete - iOS safe area */}
      <div className="fixed bottom-safe-4 left-4 flex items-center gap-3 text-xs text-slate-300 z-50">
        <Link href="/admin" className="hover:text-slate-500 transition-colors">
          Admin
        </Link>
        <span className="text-slate-200">·</span>
        <Link href="/terms" className="hover:text-slate-500 transition-colors">
          Terms
        </Link>
        <span className="text-slate-200">·</span>
        <Link href="/privacy" className="hover:text-slate-500 transition-colors">
          Privacy
        </Link>
      </div>

      {/* HERO STATE */}
      <AnimatePresence mode="wait">
        {appState === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <Hero onFileSelect={handleFileSelect} error={error} />
          </motion.div>
        )}

        {/* PROCESSING STATE */}
        {appState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 z-10 relative"
          >
            {/* Floating Decorations - Switch between regular and Christmas */}
            {isChristmas ? <FloatingChristmasDecorations /> : <FloatingDecorations />}

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <Image
                src="/logo-full.png"
                alt="LocoFace"
                width={120}
                height={120}
                className="drop-shadow-lg"
              />
            </motion.div>

            {/* Preview image with overlay and decorations */}
            <div className="relative">
              {/* Corner decorations - Christmas themed when enabled */}
              <motion.div
                className="absolute -top-4 -left-4 z-20"
                animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isChristmas ? (
                  <Ornament size={24} color="red" />
                ) : (
                  <DoodleStar size={28} className="text-star-green" />
                )}
              </motion.div>
              <motion.div
                className="absolute -top-3 -right-5 z-20"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                {isChristmas ? (
                  <Ornament size={20} color="gold" />
                ) : (
                  <DoodleHeart size={22} className="text-coral-light" filled />
                )}
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-5 z-20"
                animate={{ rotate: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                {isChristmas ? (
                  <HollyLeaf size={24} />
                ) : (
                  <DoodleHeart size={20} className="text-heart-mint" />
                )}
              </motion.div>
              <motion.div
                className="absolute -bottom-3 -right-4 z-20"
                animate={{ rotate: [0, 20, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.7 }}
              >
                {isChristmas ? (
                  <Ornament size={22} color="green" />
                ) : (
                  <DoodleStar size={24} className="text-lavender-dark" />
                )}
              </motion.div>

              <div className="w-72 h-72 sm:w-80 sm:h-80 mb-8">
                {previewImage ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-full rounded-3xl overflow-hidden shadow-xl bg-white p-2"
                    style={{ boxShadow: '0 0 0 4px white, 0 10px 40px rgba(168, 144, 196, 0.3)' }}
                  >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Processing"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender/40 via-white/50 to-coral/30 backdrop-blur-sm flex items-center justify-center">
                        <motion.div
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-coral-light flex items-center justify-center shadow-lg"
                          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles className="w-10 h-10 text-white" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <Skeleton variant="rounded" className="w-full h-full" />
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator currentStage={processingStage} />

            {/* Fun message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-slate-500 mt-4 text-center"
            >
              Making your sticker extra cute...
            </motion.p>
          </motion.div>
        )}

        {/* CHECKOUT STATE */}
        {appState === 'checkout' && previewUrl && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 z-10 relative"
          >
            {/* Floating Decorations - Switch between regular and Christmas */}
            {isChristmas ? <FloatingChristmasDecorations /> : <FloatingDecorations />}

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <Image
                src="/logo-full.png"
                alt="LocoFace"
                width={100}
                height={100}
                className="drop-shadow-lg"
              />
            </motion.div>

            {/* Checkout Card */}
            <CheckoutCard
              previewUrl={previewUrl}
              onPayWithCard={handlePurchase}
              onPayForStarterPack={handleStarterPackPurchase}
              onPromoCodeSubmit={handlePromoCode}
              isProcessing={isBuying}
            />

            {/* Onvo Pay Payment Modal */}
            <AnimatePresence>
              {showPaymentForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-safe"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) handleCancelPayment();
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
                  >
                    {/* Payment form header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-lg font-semibold text-slate-800">Complete Payment</h3>
                      <button
                        onClick={handleCancelPayment}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Email field for Starter Pack only */}
                    {isStarterPackPurchase && (
                      <div className="px-4 pt-4 pb-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                          <Mail className="w-4 h-4 text-lavender" />
                          Where should we send your codes?
                        </label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={starterPackEmail}
                          onChange={(e) => {
                            setStarterPackEmail(e.target.value);
                            starterPackEmailRef.current = e.target.value;
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-lavender focus:ring-2 focus:ring-lavender/20 outline-none text-sm"
                          autoComplete="email"
                        />
                        <p className="text-xs text-slate-500 mt-1.5">
                          We'll send your 10 promo codes to this email
                        </p>
                      </div>
                    )}

                    {/* Onvo payment form container */}
                    <div className="p-4">
                      <div id="onvo-payment-container" className="min-h-[300px]" />
                    </div>

                    {/* Security badge */}
                    <div className="p-4 border-t bg-slate-50 rounded-b-2xl">
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Secure payment powered by Onvo Pay</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirming Payment Modal */}
            <AnimatePresence>
              {isConfirmingPayment && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-safe"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 mx-auto mb-4"
                    >
                      <Sparkles className="w-12 h-12 text-coral" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {isStarterPackPurchase ? 'Processing Starter Pack...' : 'Confirming Payment...'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {isStarterPackPurchase
                        ? 'Generating your 10 promo codes'
                        : 'Please wait while we prepare your sticker'}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Starter Pack Success Modal */}
            <AnimatePresence>
              {starterPackSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-safe"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Starter Pack Activated!
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      {starterPackSuccess}
                    </p>
                    <Button
                      onClick={() => setStarterPackSuccess(null)}
                      className="w-full"
                    >
                      Got it!
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Try another button */}
            <button
              onClick={handleReset}
              className="mt-6 text-sm text-slate-500 hover:text-coral transition-colors"
            >
              &larr; Try with another photo
            </button>
          </motion.div>
        )}

        {/* RESULTS STATE */}
        {appState === 'results' && hdUrl && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12 z-10 relative"
          >
            {/* Floating Decorations - Switch between regular and Christmas */}
            {isChristmas ? <FloatingChristmasDecorations /> : <FloatingDecorations />}

            <div className="w-full max-w-md mx-auto">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-center mb-4"
              >
                <Image
                  src="/logo-full.png"
                  alt="LocoFace"
                  width={120}
                  height={120}
                  className="drop-shadow-lg"
                />
              </motion.div>

              {/* Success message - Gen Z style */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-mint-green/30 text-slate-700 rounded-full text-sm font-semibold shadow-sm border border-mint-green/40">
                  <Sparkles className="w-4 h-4 text-star-green" />
                  Your sticker is ready!
                </span>
              </motion.div>

              {/* Sticker Display with decorations */}
              <div className="relative mb-6">
                {/* Corner decorations - Christmas themed when enabled */}
                <motion.div
                  className="absolute -top-4 -left-4 z-20"
                  animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isChristmas ? (
                    <Ornament size={24} color="red" />
                  ) : (
                    <DoodleStar size={28} className="text-star-green" />
                  )}
                </motion.div>
                <motion.div
                  className="absolute -top-3 -right-5 z-20"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                >
                  {isChristmas ? (
                    <Ornament size={22} color="gold" />
                  ) : (
                    <DoodleHeart size={24} className="text-coral-light" filled />
                  )}
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-5 z-20"
                  animate={{ rotate: [0, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                  {isChristmas ? (
                    <HollyLeaf size={26} />
                  ) : (
                    <DoodleHeart size={22} className="text-heart-mint" filled />
                  )}
                </motion.div>
                <motion.div
                  className="absolute -bottom-3 -right-4 z-20"
                  animate={{ rotate: [0, 20, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.7 }}
                >
                  {isChristmas ? (
                    <Ornament size={24} color="green" />
                  ) : (
                    <DoodleStar size={26} className="text-lavender-dark" />
                  )}
                </motion.div>

                <GlassCard variant="elevated" padding="lg" className="border-2 border-white/50">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <div
                      className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-lavender/20 via-white to-coral/20 mb-4 p-2"
                      style={{ boxShadow: 'inset 0 0 20px rgba(168, 144, 196, 0.1)' }}
                    >
                      <img
                        src={hdUrl}
                        alt="Your sticker"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Download Button - Uses Web Share API on mobile */}
                  <Button
                    variant="coral"
                    glow
                    size="lg"
                    className="w-full"
                    onClick={handleDownload}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Save Sticker
                  </Button>

                  {/* Discrete share link */}
                  <p className="text-sm text-slate-400 mt-4 text-center">
                    Love it?{' '}
                    <button
                      onClick={handleShareApp}
                      className="text-coral hover:text-coral-light underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Tell a friend!
                    </button>
                  </p>
                </GlassCard>
              </div>

              {/* Create Another Button */}
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleReset}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Create Another Sticker
              </Button>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
