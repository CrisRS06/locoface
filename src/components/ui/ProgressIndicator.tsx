'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStage: 'preparing' | 'generating';
  className?: string;
}

const FUN_MESSAGES = [
  'Each sticker is 100% unique to you!',
  'AI magic is happening...',
  'Making you extra kawaii...',
  'Adding sparkles and cuteness...',
  'Almost there, stay tuned!',
  'Chibi art originated in Japan!',
  'Your sticker is being crafted...',
];

export function ProgressIndicator({ currentStage, className }: ProgressIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Timer for elapsed seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Rotate messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % FUN_MESSAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const stageLabel = currentStage === 'preparing'
    ? 'Preparing your photo...'
    : 'Creating your sticker...';

  return (
    <div className={cn('w-full max-w-sm mx-auto', className)}>
      {/* Animated Progress Bar with Shimmer */}
      <div className="relative h-2 bg-slate-200/60 rounded-full overflow-hidden mb-6">
        {/* Base gradient bar */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-coral via-coral-light to-lavender rounded-full"
          initial={{ width: '10%' }}
          animate={{
            width: currentStage === 'preparing' ? '20%' : '85%',
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <motion.div
            className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{
              x: ['-128px', '400px'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />
        </div>
      </div>

      {/* Stage Label with Icon */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-5 h-5 text-coral" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p
            key={stageLabel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-semibold text-slate-700"
          >
            {stageLabel}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Timer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-4"
      >
        <span className="text-2xl font-bold text-coral tabular-nums">
          {elapsedTime}s
        </span>
      </motion.div>

      {/* Rotating Fun Messages */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-center text-sm text-slate-500"
        >
          {FUN_MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
