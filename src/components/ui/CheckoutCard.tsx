'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Image as ImageIcon,
  Calendar,
  CheckCircle,
  Gift,
  Clock,
  CreditCard,
  Tag,
  Loader2,
  Package,
  Mail,
  Percent,
} from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface CheckoutCardProps {
  previewUrl: string;
  onPayWithCard: () => void;
  onPayForStarterPack: () => void;
  onPromoCodeSubmit: (code: string) => Promise<boolean>;
  isProcessing?: boolean;
}

const BENEFITS = [
  {
    icon: ImageIcon,
    title: 'High-quality sticker',
    description: 'Perfect for all messaging apps',
  },
  {
    icon: Calendar,
    title: 'Lifetime access',
    description: 'Use forever, no subscription',
  },
  {
    icon: CheckCircle,
    title: 'Instant delivery',
    description: "No waiting - it's ready for you!",
  },
  {
    icon: Gift,
    title: 'Perfect for sharing',
    description: 'A magical gift for friends & family',
  },
];

const REGULAR_PRICE = 4.99;
const SPECIAL_PRICE = 2.50;
const DISCOUNT_PERCENT = 50;
const COUNTDOWN_MINUTES = 5;

// Starter Pack pricing
const STARTER_PACK_PRICE = 12.99;
const STARTER_PACK_STICKERS = 10;
const STARTER_PACK_SAVINGS = Math.round((1 - (STARTER_PACK_PRICE / (SPECIAL_PRICE * STARTER_PACK_STICKERS))) * 100);

export function CheckoutCard({
  previewUrl,
  onPayWithCard,
  onPayForStarterPack,
  onPromoCodeSubmit,
  isProcessing = false,
}: CheckoutCardProps) {
  const [showStarterPack, setShowStarterPack] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_MINUTES * 60);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePromoSubmit = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    setPromoError('');

    try {
      const isValid = await onPromoCodeSubmit(promoCode.trim().toUpperCase());
      if (!isValid) {
        setPromoError('Invalid or expired promo code');
      }
    } catch {
      setPromoError('Failed to validate code. Try again.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Sticker Preview with Lock */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-6"
      >
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl">
          <img
            src={previewUrl}
            alt="Your sticker preview"
            className="w-full h-full object-contain"
          />
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-lg"
            >
              <p className="text-lg font-bold text-center">
                unlock your
                <br />
                sticker now!
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Benefits Card */}
      <GlassCard variant="elevated" padding="lg" className="mb-4">
        <div className="space-y-4">
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-coral" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  {benefit.title}
                </p>
                <p className="text-xs text-slate-500">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-4 pt-4 border-t border-slate-200/50">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Join 150,000+ happy customers</span>
          </div>
        </div>
      </GlassCard>

      {/* Countdown Timer */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center gap-2 mb-4 py-3 px-4 bg-coral/10 rounded-full border border-coral/20"
      >
        <Clock className="w-4 h-4 text-coral" />
        <span className="text-sm text-slate-700">Offer ends in</span>
        <span className="font-bold text-coral tabular-nums">
          {formatTime(timeLeft)}
        </span>
      </motion.div>

      {/* Pricing */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <p className="text-sm text-slate-500">Regular price</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">SPECIAL OFFER</span>
            <span className="px-2 py-0.5 bg-coral text-white text-xs font-bold rounded-full">
              {DISCOUNT_PERCENT}% OFF
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400 line-through">${REGULAR_PRICE.toFixed(2)}</p>
          <p className="text-2xl font-bold text-slate-900">${SPECIAL_PRICE.toFixed(2)}</p>
        </div>
      </div>

      {/* Promo Code Input */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter promo code..."
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoError('');
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none text-sm uppercase"
              disabled={isValidatingPromo || isProcessing}
            />
          </div>
          <Button
            variant="secondary"
            onClick={handlePromoSubmit}
            disabled={isValidatingPromo || isProcessing || !promoCode.trim()}
            className="px-4"
          >
            {isValidatingPromo ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
        <AnimatePresence>
          {promoError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500 mt-1 pl-2"
            >
              {promoError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Buttons */}
      <div className="space-y-3">
        {/* Card Payment Button */}
        <Button
          variant="coral"
          size="lg"
          glow
          className="w-full"
          onClick={onPayWithCard}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <CreditCard className="w-5 h-5 mr-2" />
          )}
          Buy Now - ${SPECIAL_PRICE.toFixed(2)}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or save with a pack</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Starter Pack Option */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Best Value Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 bg-gradient-to-r from-lavender to-soft-pink text-white text-xs font-bold rounded-full shadow-md">
              BEST VALUE
            </span>
          </div>

          <div className="border-2 border-lavender/50 rounded-2xl p-4 bg-gradient-to-br from-lavender/5 to-soft-pink/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-lavender" />
                <span className="font-bold text-slate-800">Starter Pack</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">${(SPECIAL_PRICE * STARTER_PACK_STICKERS).toFixed(2)}</span>
                <span className="text-xl font-bold text-slate-900">${STARTER_PACK_PRICE}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span><strong>{STARTER_PACK_STICKERS} stickers</strong> to use anytime</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Percent className="w-4 h-4 text-coral" />
                <span>Save <strong>{STARTER_PACK_SAVINGS}%</strong> vs individual</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-lavender" />
                <span>Codes delivered to your email</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full border-2 border-lavender hover:bg-lavender/10"
              onClick={onPayForStarterPack}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Package className="w-5 h-5 mr-2" />
              )}
              Get Starter Pack
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by Onvo Pay</span>
      </div>
    </div>
  );
}
