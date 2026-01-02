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
  Shield,
  Sparkles,
  ChevronDown,
  Star,
  MessageCircle,
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

// Mini testimonials
const TESTIMONIALS = [
  { text: 'Love it! Made stickers for my whole family', author: 'Maria T.', emoji: '🥰' },
  { text: 'So cute! My friends keep asking how I made it', author: 'Jake L.', emoji: '✨' },
  { text: 'Best $2.50 I ever spent. Totally worth it!', author: 'Sarah K.', emoji: '💕' },
];

// Payment icons as simple SVG components
const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto">
    <rect fill="#1A1F71" width="48" height="32" rx="4"/>
    <path fill="#fff" d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm-4.4 0h-2.8l-2.2-8.2-.9 1.3-.1.2-.6 3.4-.3 1.8-.1.6-.1.9h-2.8l2.8-10.5h3.4l2.7 10.5zm16.3-6.8c0-1.3-1.1-2.3-2.8-2.3-1.4 0-2.3.7-2.3 1.7 0 .8.6 1.3 1.9 1.7l.8.2c.6.1.9.4.9.7 0 .5-.5.8-1.4.8-.9 0-1.6-.3-2-.9l-1.5 1.2c.7.9 1.9 1.5 3.4 1.5 1.9 0 3.2-1 3.2-2.5 0-.8-.5-1.4-1.6-1.8l-1-.3c-.7-.2-1-.4-1-.8 0-.4.4-.7 1.1-.7.7 0 1.3.3 1.6.7l1.3-1.2c-.6-.7-1.5-1.1-2.6-1.1zm5.1-3.7L33.8 21h2.9l.4-1.8h3.1l.2 1.8h2.5l-2.2-10.5h-3.2zm1.8 6.6l1.3-5.1.6 5.1h-1.9z"/>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto">
    <rect fill="#000" width="48" height="32" rx="4"/>
    <circle fill="#EB001B" cx="18" cy="16" r="9"/>
    <circle fill="#F79E1B" cx="30" cy="16" r="9"/>
    <path fill="#FF5F00" d="M24 9.5c2.1 1.7 3.5 4.3 3.5 7.2s-1.4 5.5-3.5 7.2c-2.1-1.7-3.5-4.3-3.5-7.2s1.4-5.5 3.5-7.2z"/>
  </svg>
);

const ApplePayIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto">
    <rect fill="#000" width="48" height="32" rx="4"/>
    <path fill="#fff" d="M12.7 11.5c-.4.5-1.1.9-1.8.8-.1-.7.3-1.4.7-1.9.4-.5 1.2-.9 1.8-.9.1.7-.2 1.5-.7 2zm.7.9c-1 0-1.8.6-2.3.6-.5 0-1.2-.5-2-.5-1 0-2 .6-2.5 1.5-1.1 1.9-.3 4.6.8 6.1.5.7 1.1 1.5 1.9 1.5.8 0 1.1-.5 2-.5s1.2.5 2 .5c.8 0 1.3-.7 1.8-1.4.6-.8.8-1.6.8-1.6-.8-.3-1.4-1.2-1.4-2.4 0-1 .5-1.9 1.4-2.4-.5-.8-1.4-1.4-2.5-1.4zm10.5 6.8V12h-1.5v2.3h-.9v1.2h.9v3.9c0 1.2.6 1.8 1.9 1.8h.9v-1.2h-.6c-.5 0-.7-.2-.7-.7zm6.3-2.9c-.3-.7-1-1.2-1.9-1.2-.8 0-1.5.4-1.8 1v-.9h-1.4v6.1h1.5v-3.3c0-.9.5-1.5 1.3-1.5.7 0 1.1.5 1.1 1.3v3.4h1.5v-3.7c.2-.5.6-.8 1.2-.8.7 0 1 .4 1 1.3v3.3h1.5v-3.5c-.1-1.3-.7-2.2-2-2.2-.8 0-1.4.4-1.7 1.1l-.3-.4z"/>
  </svg>
);

const GooglePayIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto">
    <rect fill="#fff" width="48" height="32" rx="4" stroke="#e5e5e5"/>
    <path fill="#4285F4" d="M24.6 16.8v3h-1.3v-7.5h3.4c.8 0 1.5.3 2.1.8.6.5.9 1.2.9 2s-.3 1.5-.9 2c-.6.5-1.3.8-2.1.8h-2.1zm0-3.5v2.4h2.2c.5 0 .9-.2 1.2-.5.3-.3.5-.7.5-1.2 0-.5-.2-.9-.5-1.2-.3-.3-.7-.5-1.2-.5h-2.2z"/>
    <path fill="#34A853" d="M34.1 14.4c.9 0 1.6.2 2.1.7.5.5.8 1.1.8 2v4.7h-1.2v-1.1c-.4.8-1.2 1.2-2.2 1.2-.7 0-1.3-.2-1.8-.6-.5-.4-.7-.9-.7-1.5s.2-1.1.7-1.5c.5-.4 1.1-.5 2-.5.7 0 1.3.1 1.8.4v-.3c0-.5-.2-.9-.5-1.2-.3-.3-.8-.5-1.3-.5-.7 0-1.2.3-1.5.8l-1.1-.7c.6-.8 1.4-1.2 2.6-1.2l.3.1zm-1.6 5c0 .3.1.6.4.8.3.2.6.3 1 .3.5 0 1-.2 1.4-.6.4-.4.6-.8.6-1.3-.4-.3-.9-.4-1.6-.4-.5 0-.9.1-1.2.3-.4.2-.6.5-.6.9z"/>
    <path fill="#EA4335" d="M44.3 14.5l-4 9.2h-1.4l1.5-3.2-2.6-6h1.5l1.8 4.4 1.8-4.4h1.4z"/>
  </svg>
);

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
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoShake, setPromoShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_MINUTES * 60);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  const FAQ_ITEMS = [
    {
      question: t('faq.use_question') || 'How do I use my sticker?',
      answer: t('faq.use_answer') || 'Download and share on WhatsApp, iMessage, Telegram, Instagram, and more!',
    },
    {
      question: t('faq.safe_question') || 'Is my photo safe?',
      answer: t('faq.safe_answer') || 'Yes! We don\'t store your photos. They\'re deleted right after processing.',
    },
    {
      question: t('faq.refund_question') || 'Can I get a refund?',
      answer: t('faq.refund_answer') || '100% satisfaction guaranteed. Contact support@locoface.com for any issues.',
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
      triggerShake();
      return;
    }

    setIsValidatingPromo(true);
    setPromoError('');
    setPromoSuccess(false);

    try {
      const isValid = await onPromoCodeSubmit(promoCode.trim().toUpperCase());
      if (isValid) {
        setPromoSuccess(true);
      } else {
        setPromoError(t('promo_error_invalid'));
        triggerShake();
      }
    } catch {
      setPromoError(t('promo_error_failed'));
      triggerShake();
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const triggerShake = () => {
    setPromoShake(true);
    setTimeout(() => setPromoShake(false), 500);
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

      {/* Mini Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 px-2"
      >
        <div className="flex items-center gap-1 mb-2">
          <MessageCircle className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{t('testimonials_title') || 'What customers say'}</span>
        </div>
        <div className="space-y-2">
          {TESTIMONIALS.slice(0, 2).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-start gap-2 text-sm"
            >
              <span className="text-base">{testimonial.emoji}</span>
              <p className="text-slate-600 italic">
                &ldquo;{testimonial.text}&rdquo; <span className="text-slate-400 not-italic">- {testimonial.author}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

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

      {/* Promo Code Input with micro-interactions */}
      <div className="mb-4">
        <div className="flex gap-2">
          <motion.div
            className="relative flex-1"
            animate={promoShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('promo_placeholder')}
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoError('');
                setPromoSuccess(false);
              }}
              className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 outline-none text-sm uppercase transition-all ${
                promoSuccess
                  ? 'border-green-500 bg-green-50 focus:ring-2 focus:ring-green-500/20'
                  : promoError
                  ? 'border-red-400 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-coral focus:ring-2 focus:ring-coral/20'
              }`}
              disabled={isValidatingPromo || isProcessing || promoSuccess}
            />
            {/* Success checkmark */}
            <AnimatePresence>
              {promoSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <Button
            variant="secondary"
            onClick={handlePromoSubmit}
            disabled={isValidatingPromo || isProcessing || !promoCode.trim() || promoSuccess}
            className="px-4"
          >
            {isValidatingPromo ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : promoSuccess ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              t('promo_apply')
            )}
          </Button>
        </div>
        <AnimatePresence mode="wait">
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
          {promoSuccess && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-green-600 mt-1 pl-2 font-medium"
            >
              {t('promo_success') || '✓ Code applied! 100% off your sticker'}
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

        {/* Starter Pack Option - MOST POPULAR (highlighted) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Most Popular Badge - Changed from Best Value */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 bg-gradient-to-r from-coral to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {t('most_popular') || 'MOST POPULAR'}
            </span>
          </div>

          <div className="border-2 border-coral rounded-2xl p-4 bg-gradient-to-br from-coral/5 to-orange-500/5 ring-2 ring-coral/20 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-coral" />
                <span className="font-bold text-slate-800">{t('starter_pack')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">${(SPECIAL_PRICE * STARTER_PACK_STICKERS).toFixed(2)}</span>
                <span className="text-xl font-bold text-coral">${STARTER_PACK_PRICE}</span>
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
                <Mail className="w-4 h-4 text-coral" />
                <span>{t('codes_to_email')}</span>
              </div>
            </div>

            <Button
              variant="coral"
              size="lg"
              glow
              className="w-full"
              onClick={onPayForStarterPack}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {t('get_starter_pack')}
            </Button>
          </div>
        </motion.div>

        {/* Super Pack Option - BEST VALUE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mt-3"
        >
          {/* Best Value Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 bg-gradient-to-r from-lavender to-soft-pink text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {t('best_value')}
            </span>
          </div>

          <div className="border-2 border-lavender/50 rounded-2xl p-4 bg-gradient-to-br from-lavender/5 to-soft-pink/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-lavender" />
                <span className="font-bold text-slate-800">{t('super_pack') || 'Super Pack'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">${(SPECIAL_PRICE * SUPER_PACK_STICKERS).toFixed(2)}</span>
                <span className="text-xl font-bold text-slate-900">${SUPER_PACK_PRICE}</span>
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
                <Mail className="w-4 h-4 text-lavender" />
                <span>{t('super_pack_codes_to_email') || t('codes_to_email')}</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full border-2 border-lavender hover:bg-lavender/10"
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

      {/* Trust Badges Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 pt-4 border-t border-slate-200"
      >
        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <VisaIcon />
          <MastercardIcon />
          <ApplePayIcon />
          <GooglePayIcon />
        </div>

        {/* Trust Guarantees */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Shield className="w-4 h-4 text-green-500" />
            <span>{t('guarantee') || '100% Satisfaction Guarantee'}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>{t('secure_payment')}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Zap className="w-4 h-4 text-coral" />
            <span>{t('instant_delivery') || 'Instant delivery to your phone'}</span>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 pt-4 border-t border-slate-200"
      >
        <p className="text-xs font-medium text-slate-500 mb-3 text-center">{t('faq_title') || 'Frequently Asked Questions'}</p>
        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.question}</span>
                <motion.div
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-3 text-sm text-slate-600">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
