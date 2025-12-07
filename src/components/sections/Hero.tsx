'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SocialProof } from '@/components/ui/SocialProof';
import { HeroShowcase } from '@/components/ui/HeroShowcase';
import { FloatingDecorations, DoodleStar, DoodleHeart } from '@/components/ui/Decorations';
import { useChristmas } from '@/contexts/ChristmasContext';
import { ChristmasToggle } from '@/components/ui/ChristmasToggle';
import { Snowfall } from '@/components/ui/Snowfall';
import { FloatingChristmasDecorations, SantaHat, ChristmasLights } from '@/components/ui/ChristmasDecorations';

interface HeroProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
}

export function Hero({ onFileSelect, error }: HeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isChristmas } = useChristmas();

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-12 pb-20 overflow-hidden">
      {/* Snowfall effect - Only when Christmas mode is ON */}
      {isChristmas && <Snowfall />}

      {/* Christmas Lights at the top */}
      {isChristmas && (
        <div className="absolute top-0 left-0 right-0 z-20">
          <ChristmasLights className="w-full" />
        </div>
      )}

      {/* Background Gradient Blobs - Christmas colors when enabled */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 -left-40 w-96 h-96 rounded-full filter blur-3xl animate-blob transition-all duration-500 ${
            isChristmas
              ? 'bg-red-400 opacity-40'
              : 'bg-lavender opacity-60 mix-blend-multiply'
          }`}
        />
        <div
          className={`absolute top-20 -right-40 w-96 h-96 rounded-full filter blur-3xl animate-blob animation-delay-2000 transition-all duration-500 ${
            isChristmas
              ? 'bg-green-500 opacity-35'
              : 'bg-coral-light opacity-40 mix-blend-multiply'
          }`}
        />
        <div
          className={`absolute bottom-20 left-20 w-96 h-96 rounded-full filter blur-3xl animate-blob animation-delay-4000 transition-all duration-500 ${
            isChristmas
              ? 'bg-yellow-400 opacity-30'
              : 'bg-mint-green opacity-30 mix-blend-multiply'
          }`}
        />
        {/* Extra Christmas blob */}
        {isChristmas && (
          <div className="absolute bottom-40 right-10 w-80 h-80 bg-red-300 opacity-25 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        )}
      </div>

      {/* Floating Decorations - Switch between regular and Christmas */}
      {isChristmas ? <FloatingChristmasDecorations /> : <FloatingDecorations />}

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        {/* Christmas Toggle - Inside Hero, near the top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-4"
        >
          <ChristmasToggle />
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mb-6 relative"
        >
          {/* Santa Hat on Logo - Only when Christmas mode is ON */}
          {isChristmas && (
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
              initial={{ opacity: 0, y: -10, rotate: -15 }}
              animate={{ opacity: 1, y: 0, rotate: -12 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <SantaHat size={60} />
            </motion.div>
          )}

          {/* Decorative elements around logo */}
          <motion.div
            className="absolute -top-2 -right-4"
            animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <DoodleStar
              size={20}
              className={isChristmas ? 'text-christmas-gold' : 'text-star-green'}
            />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-3"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <DoodleHeart
              size={16}
              className={isChristmas ? 'text-christmas-red' : 'text-heart-mint'}
              filled
            />
          </motion.div>

          {/* Logo image with text */}
          <Image
            src="/logo-full.png"
            alt="LocoFace"
            width={220}
            height={220}
            className="drop-shadow-xl"
            priority
          />
        </motion.div>

        {/* Hero Showcase - Front and Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6, type: 'spring' }}
          className="mb-8"
        >
          <HeroShowcase />
        </motion.div>

        {/* Headline - Gen Z style with Christmas variant */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="heading-hero text-center text-balance mb-3"
        >
          {isChristmas ? (
            <>
              Turn Your Face Into{' '}
              <span className="gradient-text-christmas">
                Christmas Stickers
              </span>{' '}
              🎄
            </>
          ) : (
            <>
              Turn Your Face Into{' '}
              <span className="gradient-text">Cute Stickers</span>
            </>
          )}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-base sm:text-lg text-slate-600 text-center max-w-md mb-6"
        >
          {isChristmas
            ? 'Create festive chibi stickers with Santa hats! 🎅'
            : 'AI-powered chibi stickers in seconds. No account needed.'}
        </motion.p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
        />

        {/* CTA Button - Opens file picker directly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mb-6"
        >
          <Button
            variant="coral"
            size="xl"
            glow
            onClick={() => fileInputRef.current?.click()}
            className="text-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Your Photo
          </Button>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-2xl max-w-md"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <SocialProof
            rating={4.9}
            stickerCount="50,000+"
            variant="default"
          />
        </motion.div>

      </div>
    </section>
  );
}
