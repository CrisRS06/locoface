'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stage {
  id: string;
  label: string;
  funFact?: string;
}

interface ProgressIndicatorProps {
  currentStage: string;
  className?: string;
}

const STAGES: Stage[] = [
  {
    id: 'uploading',
    label: 'Uploading your photo...',
    funFact: 'Chibi art originated in Japan in the 1980s!',
  },
  {
    id: 'analyzing',
    label: 'Analyzing facial features...',
    funFact: 'Our AI has created over 50,000 cute stickers!',
  },
  {
    id: 'generating',
    label: 'Creating your sticker...',
    funFact: 'Each sticker is 100% unique to you!',
  },
  {
    id: 'ready',
    label: 'Your sticker is ready!',
    funFact: '',
  },
];

export function ProgressIndicator({ currentStage, className }: ProgressIndicatorProps) {
  const [funFactIndex, setFunFactIndex] = useState(0);
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
  const currentStageData = STAGES[currentIndex];
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / STAGES.length) * 100 : 0;

  // Rotate fun facts every 5 seconds
  useEffect(() => {
    if (currentStage === 'ready') return;

    const interval = setInterval(() => {
      setFunFactIndex((prev) => (prev + 1) % STAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentStage]);

  const displayedFunFact =
    currentStageData?.funFact || STAGES[funFactIndex]?.funFact || '';

  return (
    <div className={cn('w-full max-w-sm mx-auto', className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isReady = stage.id === 'ready' && currentStage === 'ready';

          return (
            <div key={stage.id} className="flex items-center flex-1">
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                  isCompleted && 'bg-dusty-lime text-slate-800',
                  isCurrent && !isReady && 'gradient-cta text-white',
                  isReady && 'bg-dusty-lime text-slate-800',
                  !isCompleted && !isCurrent && 'bg-slate-200 text-slate-400'
                )}
                animate={
                  isCurrent && !isReady
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{
                  repeat: isCurrent && !isReady ? Infinity : 0,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
              >
                {isCompleted || isReady ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </motion.div>

              {index < STAGES.length - 1 && (
                <div className="flex-1 h-1 mx-2 rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    className="h-full gradient-cta"
                    initial={{ width: 0 }}
                    animate={{
                      width: isCompleted ? '100%' : isCurrent ? '50%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-4">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Current Stage Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center text-lg font-medium text-slate-700"
        >
          {currentStageData?.label}
        </motion.p>
      </AnimatePresence>

      {/* Fun Fact */}
      {displayedFunFact && currentStage !== 'ready' && (
        <AnimatePresence mode="wait">
          <motion.p
            key={displayedFunFact}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-sm text-slate-500 mt-3"
          >
            {displayedFunFact}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}
