'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'large';
}

export function ShareButtons({
  url,
  title = 'Check out my AI sticker!',
  text = 'I made this cute sticker with Locoface!',
  className,
  variant = 'default',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        // User cancelled or share failed silently
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const buttonBase = cn(
    'flex items-center justify-center rounded-full transition-all',
    'min-h-[44px] min-w-[44px]', // Touch target
    'active:scale-95'
  );

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {'share' in navigator && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNativeShare}
            className={cn(buttonBase, 'w-10 h-10 bg-slate-100 hover:bg-slate-200')}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className={cn(buttonBase, 'w-10 h-10 bg-slate-100 hover:bg-slate-200')}
          aria-label={copied ? 'Copied!' : 'Copy link'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-slate-600" />
          )}
        </motion.button>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <p className="text-sm text-slate-500 mb-1">Share your sticker</p>
        <div className="flex items-center gap-3">
          {'share' in navigator && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNativeShare}
              className={cn(
                buttonBase,
                'w-14 h-14 gradient-cta text-white shadow-lg shadow-coral/30'
              )}
              aria-label="Share"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareToWhatsApp}
            className={cn(
              buttonBase,
              'w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
            )}
            aria-label="Share to WhatsApp"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className={cn(
              buttonBase,
              'w-14 h-14 bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-lg'
            )}
            aria-label={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? (
              <Check className="w-6 h-6 text-green-500" />
            ) : (
              <Copy className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {'share' in navigator && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNativeShare}
          className={cn(
            buttonBase,
            'w-12 h-12 gradient-cta text-white shadow-md shadow-coral/20'
          )}
          aria-label="Share"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={shareToWhatsApp}
        className={cn(
          buttonBase,
          'w-12 h-12 bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20'
        )}
        aria-label="Share to WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className={cn(
          buttonBase,
          'w-12 h-12 bg-slate-200 hover:bg-slate-300 text-slate-600 shadow-md'
        )}
        aria-label={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </motion.button>
    </div>
  );
}
