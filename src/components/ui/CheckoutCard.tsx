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
  Zap,
  Crown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface CheckoutCardProps {
  previewUrl: string;
  onPayWithCard: () => void;
  onPayForStarterPack: () => void;
  onPayForSuperPack: () => void;
  onPromoCodeSubmit: (code: string) => Promise<boolean>;
  isProcessing?: boolean;
}

const REGULAR_PRICE = 4.99;
const SPECIAL_PRICE = 2.50;
const DISCOUNT_PERCENT = 50;
const COUNTDOWN_MINUTES = 5;

// Starter Pack pricing
const STARTER_PACK_PRICE = 9.99;
const STARTER_PACK_STICKERS = 10;
const STARTER_PACK_SAVINGS = Math.round((1 - (STARTER_PACK_PRICE / (SPECIAL_PRICE * STARTER_PACK_STICKERS))) * 100);

// Super Pack pricing - Best for ads/power users
const SUPER_PACK_PRICE = 19.99;
const SUPER_PACK_STICKERS = 30;
const SUPER_PACK_SAVINGS = Math.round((1 - (SUPER_PACK_PRICE / (SPECIAL_PRICE * SUPER_PACK_STICKERS))) * 100);

export function CheckoutCard({
  previewUrl,
  onPayWithCard,
  onPayForStarterPack,
  onPayForSuperPack,
  onPromoCodeSubmit,
  isProcessing = false,
}: CheckoutCardProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_MINUTES * 60);
  const t = useTranslations('checkout');
  const tSocial = useTranslations('social');

  const BENEFITS = [
    {
      icon: ImageIcon,
      title: t('benefits.quality.title'),
      description: t('benefits.quality.description'),
    },
    {
      icon: Calendar,
      title: t('benefits.lifetime.title'),
      description: t('benefits.lifetime.description'),
    },
    {
      icon: CheckCircle,
      title: t('benefits.instant.title'),
      description: t('benefits.instant.description'),
    },
    {
      icon: Gift,
      title: t('benefits.sharing.title'),
      description: t('benefits.sharing.description'),
    },
  ];

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
      setPromoError(t('promo_error_empty'));
      return;
    }

    setIsValidatingPromo(true);
    setPromoError('');

    try {
      const isValid = await onPromoCodeSubmit(promoCode.trim().toUpperCase());
      if (!isValid) {
        setPromoError(t('promo_error_invalid'));
      }
    } catch {
      setPromoError(t('promo_error_failed'));
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
                {t('unlock')}
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
              key={index}
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
            <span>{tSocial('join_customers', { count: '847,000+' })}</span>
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
        <span className="text-sm text-slate-700">{t('offer_ends')}</span>
        <span className="font-bold text-coral tabular-nums">
          {formatTime(timeLeft)}
        </span>
      </motion.div>

      {/* Pricing */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <p className="text-sm text-slate-500">{t('regular_price')}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">{t('special_offer')}</span>
            <span className="px-2 py-0.5 bg-coral text-white text-xs font-bold rounded-full">
              {DISCOUNT_PERCENT}% {t('off')}
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
              placeholder={t('promo_placeholder')}
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
              t('promo_apply')
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
          {t('buy_now')} - ${SPECIAL_PRICE.toFixed(2)}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">{t('or_save')}</span>
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
              {t('best_value')}
            </span>
          </div>

          <div className="border-2 border-lavender/50 rounded-2xl p-4 bg-gradient-to-br from-lavender/5 to-soft-pink/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-lavender" />
                <span className="font-bold text-slate-800">{t('starter_pack')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">${(SPECIAL_PRICE * STARTER_PACK_STICKERS).toFixed(2)}</span>
                <span className="text-xl font-bold text-slate-900">${STARTER_PACK_PRICE}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span><strong>{STARTER_PACK_STICKERS}</strong> {t('stickers_anytime', { count: STARTER_PACK_STICKERS }).replace(`${STARTER_PACK_STICKERS} `, '')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Percent className="w-4 h-4 text-coral" />
                <span>{t('save_percent', { percent: STARTER_PACK_SAVINGS })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-lavender" />
                <span>{t('codes_to_email')}</span>
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
              {t('get_starter_pack')}
            </Button>
          </div>
        </motion.div>

        {/* Super Pack Option - MAX VALUE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mt-3"
        >
          {/* Max Value Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 bg-gradient-to-r from-coral to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {t('max_value') || 'MAX VALUE'}
            </span>
          </div>

          <div className="border-2 border-coral/50 rounded-2xl p-4 bg-gradient-to-br from-coral/5 to-orange-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-coral" />
                <span className="font-bold text-slate-800">{t('super_pack') || 'Super Pack'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">${(SPECIAL_PRICE * SUPER_PACK_STICKERS).toFixed(2)}</span>
                <span className="text-xl font-bold text-coral">${SUPER_PACK_PRICE}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span><strong>{SUPER_PACK_STICKERS}</strong> {t('stickers_anytime', { count: SUPER_PACK_STICKERS }).replace(`${SUPER_PACK_STICKERS} `, '')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Percent className="w-4 h-4 text-coral" />
                <span>{t('save_percent', { percent: SUPER_PACK_SAVINGS })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-coral" />
                <span>{t('codes_to_email')}</span>
              </div>
            </div>

            <Button
              variant="coral"
              size="lg"
              className="w-full"
              onClick={onPayForSuperPack}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Zap className="w-5 h-5 mr-2" />
              )}
              {t('get_super_pack') || 'Get Super Pack'}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
        <Lock className="w-3 h-3" />
        <span>{t('secure_payment')}</span>
      </div>
    </div>
  );
}
