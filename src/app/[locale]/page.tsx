'use client';

import { useState } from 'react';
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
import { useLemonSqueezy } from '@/hooks/useLemonSqueezy';
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
  const [starterPackEmail, setStarterPackEmail] = useState('');

  // Christmas mode
  const { isChristmas } = useChristmas();

  // Lemon Squeezy checkout hook - uses full page redirect for Apple Pay support
  const { isReady: lemonReady, openCheckout } = useLemonSqueezy({
    onError: (error) => {
      console.error('Payment error:', error);
      setError('Failed to start checkout. Please try again.');
      setIsBuying(false);
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

  // Purchase handler - Lemon Squeezy (full page redirect for Apple Pay)
  const handlePurchase = async () => {
    if (!previewId || !lemonReady) return;

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
      const response = await fetch('/api/checkout/lemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId, type: 'individual' }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout (enables Apple Pay)
        openCheckout(data.checkoutUrl);
        // Note: User will be redirected back to /download/{orderId} after payment
      } else {
        throw new Error('Failed to create checkout');
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

  // Starter Pack purchase handler - Lemon Squeezy (full page redirect for Apple Pay)
  const handleStarterPackPurchase = async () => {
    if (!lemonReady) return;

    // Need email first
    if (!starterPackEmail || !starterPackEmail.includes('@')) {
      setError('Please enter a valid email to receive your codes');
      return;
    }

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

    setIsBuying(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/lemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'starter_pack', email: starterPackEmail }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout (enables Apple Pay)
        openCheckout(data.checkoutUrl);
        // Note: User will be redirected back to /thank-you after payment
        // Webhook will send promo codes to their email
      } else {
        throw new Error('Failed to create checkout');
      }
    } catch (err) {
      console.error('Starter pack checkout error:', err);
      setError('Failed to start checkout. Please try again.');
      setIsBuying(false);
    }
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

            {/* Email input for Starter Pack - shown before CheckoutCard */}
            <div className="w-full max-w-md mb-4 px-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 text-lavender" />
                  Email for Starter Pack
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={starterPackEmail}
                  onChange={(e) => setStarterPackEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-lavender focus:ring-2 focus:ring-lavender/20 outline-none text-sm"
                  autoComplete="email"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Required to receive your 10 promo codes
                </p>
              </div>
            </div>

            {/* Checkout Card */}
            <CheckoutCard
              previewUrl={previewUrl}
              onPayWithCard={handlePurchase}
              onPayForStarterPack={handleStarterPackPurchase}
              onPromoCodeSubmit={handlePromoCode}
              isProcessing={isBuying}
            />

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
