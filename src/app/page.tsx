'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus,
  Upload,
  Camera,
  AlertCircle,
  RefreshCw,
  Download,
  Sparkles,
} from 'lucide-react';
import { Hero } from '@/components/sections/Hero';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Skeleton } from '@/components/ui/Skeleton';
import { Confetti } from '@/components/ui/Confetti';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { useLemonSqueezy } from '@/hooks/useLemonSqueezy';
import { cn } from '@/lib/utils';

// App States
type AppState = 'hero' | 'upload' | 'processing' | 'results';
type ProcessingStage = 'uploading' | 'analyzing' | 'generating' | 'ready';

export default function Home() {
  // State management
  const [appState, setAppState] = useState<AppState>('hero');
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('uploading');
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // LemonSqueezy checkout hook
  const { openCheckout } = useLemonSqueezy({
    onSuccess: () => {
      // Handle successful payment
      console.log('Payment successful!');
      setIsBuying(false);
    },
    onClose: () => {
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
    setStickerUrl(null);
    setPreviewId(undefined);
    setAppState('processing');
    setProcessingStage('uploading');

    // Show preview of original image
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      // Stage 1: Uploading
      setProcessingStage('uploading');
      await new Promise((resolve) => setTimeout(resolve, 500)); // Brief pause for UX

      // Stage 2: Analyzing
      setProcessingStage('analyzing');

      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', 'guest');

      // Stage 3: Generating
      setProcessingStage('generating');

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process image');
      }

      // Stage 4: Ready
      setProcessingStage('ready');
      setStickerUrl(data.watermarkedUrl);
      setPreviewId(data.previewId);

      // Brief delay before showing results
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Trigger celebration!
      setShowConfetti(true);
      setAppState('results');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAppState('upload');
    }
  };

  // File handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImage(file);
  }, []);

  // Camera capture (mobile)
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processImage(file);
    };
    input.click();
  };

  // Purchase handler
  const handlePurchase = async () => {
    if (!previewId) return;

    setIsBuying(true);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        openCheckout(data.checkoutUrl);
      } else {
        throw new Error('Failed to create checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to start checkout. Please try again.');
      setIsBuying(false);
    }
  };

  // Reset to create another
  const handleReset = () => {
    setStickerUrl(null);
    setPreviewId(undefined);
    setPreviewImage(null);
    setError(null);
    setShowConfetti(false);
    setAppState('hero');
    setProcessingStage('uploading');
  };

  // Start creating from hero
  const handleStartCreating = () => {
    setAppState('upload');
    // Scroll to upload area smoothly
    setTimeout(() => {
      fileInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <main className="min-h-screen gradient-bg-soft flex flex-col items-center overflow-hidden relative">
      {/* Confetti Celebration */}
      <Confetti trigger={showConfetti} />

      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-lavender rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-40 -right-40 w-80 h-80 bg-soft-pink rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-coral rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

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
            <Hero onCtaClick={handleStartCreating} />
          </motion.div>
        )}

        {/* UPLOAD STATE */}
        {appState === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto px-4 py-12 z-10"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 gradient-cta rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-coral/30"
              >
                <ImagePlus className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Upload Your Photo
              </h2>
              <p className="text-slate-600">
                Best results with a clear, front-facing photo
              </p>
            </div>

            {/* Upload Zone */}
            <GlassCard
              variant="elevated"
              padding="lg"
              className={cn(
                'upload-zone cursor-pointer transition-all',
                dragActive && 'upload-zone-dragover'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 rounded-full bg-lavender/50 flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-lavender-dark" />
                </div>
                <p className="text-lg font-medium text-slate-700 mb-1">
                  Drop your photo here
                </p>
                <p className="text-sm text-slate-500">
                  or click to browse
                </p>
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="coral"
                glow
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Photo
              </Button>

              {/* Camera button for mobile */}
              <Button
                variant="secondary"
                onClick={handleCameraCapture}
                className="sm:hidden"
                aria-label="Take photo"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>

            {/* Photo tips */}
            <div className="mt-6 p-4 bg-lavender/20 rounded-2xl">
              <p className="text-sm text-slate-600 text-center">
                <Sparkles className="w-4 h-4 inline mr-1 text-coral" />
                Tip: Good lighting and a clear face work best!
              </p>
            </div>

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

            {/* Back button */}
            <button
              onClick={() => setAppState('hero')}
              className="mt-6 text-sm text-slate-500 hover:text-slate-700 mx-auto block"
            >
              &larr; Back to home
            </button>
          </motion.div>
        )}

        {/* PROCESSING STATE */}
        {appState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto px-4 py-12 z-10 flex flex-col items-center justify-center min-h-[80vh]"
          >
            {/* Preview image with overlay */}
            <div className="relative w-64 h-64 mb-8">
              {previewImage ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full h-full rounded-3xl overflow-hidden shadow-xl"
                >
                  <img
                    src={previewImage}
                    alt="Processing"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full gradient-cta flex items-center justify-center animate-pulse-soft">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <Skeleton variant="rounded" className="w-full h-full" />
              )}
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator currentStage={processingStage} />
          </motion.div>
        )}

        {/* RESULTS STATE */}
        {appState === 'results' && stickerUrl && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto px-4 py-12 z-10"
          >
            {/* Success message */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-dusty-lime/50 text-slate-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 text-green-600" />
                Your sticker is ready!
              </span>
            </motion.div>

            {/* Sticker Display */}
            <GlassCard variant="elevated" padding="lg" className="mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="animate-celebrate"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-lavender/20 to-coral/20 mb-4">
                  <img
                    src={stickerUrl}
                    alt="Your sticker"
                    className="w-full h-full object-contain sticker-image"
                  />
                </div>
              </motion.div>

              {/* Download Button - Free (paywall disabled) */}
              <Button
                variant="coral"
                glow
                size="lg"
                className="w-full mb-3"
                onClick={() => {
                  if (stickerUrl) {
                    const link = document.createElement('a');
                    link.href = stickerUrl;
                    link.download = 'locoface-sticker.png';
                    link.click();
                  }
                }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Sticker
              </Button>

              {/* Share Buttons */}
              <div className="pt-4 border-t border-slate-200/50">
                <ShareButtons
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title="Check out my AI sticker!"
                  text="I made this cute chibi sticker with Locoface!"
                  variant="default"
                />
              </div>
            </GlassCard>

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
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
