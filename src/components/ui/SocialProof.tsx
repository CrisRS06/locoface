'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialProofProps {
  rating?: number;
  reviewCount?: string;
  stickerCount?: string;
  variant?: 'default' | 'compact' | 'large';
  className?: string;
}

export function SocialProof({
  rating = 4.9,
  reviewCount = '1,200+',
  stickerCount = '50,000+',
  variant = 'default',
  className,
}: SocialProofProps) {
  const StarIcon = ({ filled }: { filled: boolean }) => (
    <Star
      className={cn(
        'transition-colors',
        variant === 'large' ? 'w-6 h-6' : 'w-4 h-4',
        filled ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'
      )}
    />
  );

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
        <span>{stickerCount} stickers created</span>
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
          Rated by <span className="font-semibold">{reviewCount}</span> happy creators
        </p>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-coral">{stickerCount}</span> cute stickers made
        </p>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('flex flex-col items-center gap-2', className)}
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
        Loved by <span className="font-semibold">{stickerCount}</span> happy creators
      </p>
    </motion.div>
  );
}
