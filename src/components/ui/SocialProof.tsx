'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface SocialProofProps {
  rating?: number;
  reviewCount?: string;
  stickerCount?: string;
  variant?: 'default' | 'compact' | 'large';
  showViewingNow?: boolean;
  className?: string;
}

// Format number with K suffix for large numbers
function formatCount(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  }
  return num.toLocaleString() + '+';
}

export function SocialProof({
  rating = 4.9,
  reviewCount = '1,200+',
  stickerCount: initialCount = '847K+',
  variant = 'default',
  showViewingNow = true,
  className,
}: SocialProofProps) {
  const t = useTranslations('social');
  const [stickerCount, setStickerCount] = useState(initialCount);
  const [viewingNow, setViewingNow] = useState<number | null>(null);

  // Fetch real stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.stickerCount) {
          setStickerCount(formatCount(data.stickerCount));
        }
        if (data.viewingNow) {
          setViewingNow(data.viewingNow);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();

    // Refresh viewing count every 30 seconds for dynamic feel
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <Star
      className={cn(
        'transition-colors',
        variant === 'large' ? 'w-6 h-6' : 'w-4 h-4',
        filled ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'
      )}
    />
  );

  // Viewing Now indicator component
  const ViewingNowBadge = () => {
    if (!showViewingNow || viewingNow === null) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <Eye className="w-3.5 h-3.5 text-green-600" />
        <span className="text-green-700 font-medium">
          {viewingNow} {t('viewing_now') || 'viewing now'}
        </span>
      </motion.div>
    );
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('flex items-center gap-2 text-sm text-slate-600', className)}
      >
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={i < Math.floor(rating)} />
          ))}
        </div>
        <span className="font-medium">{rating}</span>
        <span className="text-slate-400">•</span>
        <span>{stickerCount} {t('stickers_created')}</span>
      </motion.div>
    );
  }

  if (variant === 'large') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn('text-center', className)}
      >
        <div className="flex items-center justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <StarIcon filled={i < Math.floor(rating)} />
            </motion.div>
          ))}
          <span className="ml-2 text-2xl font-bold text-slate-800">{rating}</span>
        </div>
        <p className="text-slate-600 mb-1">
          {t('rating', { count: reviewCount })}
        </p>
        <p className="text-sm text-slate-500 mb-3">
          <span className="font-semibold text-coral">{stickerCount}</span> {t('stickers_created')}
        </p>
        <div className="flex justify-center">
          <ViewingNowBadge />
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('flex flex-col items-center gap-3', className)}
    >
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
          >
            <StarIcon filled={i < Math.floor(rating)} />
          </motion.div>
        ))}
        <span className="ml-2 font-semibold text-slate-800">{rating}</span>
      </div>
      <p className="text-sm text-slate-600">
        {t('loved_by', { count: stickerCount })}
      </p>
      <ViewingNowBadge />
    </motion.div>
  );
}
