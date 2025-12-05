'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Example {
  before: string;
  after: string;
  label?: string;
}

interface BeforeAfterProps {
  examples: Example[];
  className?: string;
}

export function BeforeAfter({ examples, className }: BeforeAfterProps) {
  return (
    <div
      className={cn(
        'flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory',
        className
      )}
    >
      {examples.map((example, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15, duration: 0.4 }}
          className="flex-shrink-0 flex items-center gap-3 snap-center"
        >
          {/* Before Image */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shadow-md">
            {example.before ? (
              <img
                src={example.before}
                alt="Original photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Photo
              </div>
            )}
          </div>

          {/* Arrow */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.15 + 0.2, type: 'spring' }}
            className="flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-lavender-dark" />
            </div>
          </motion.div>

          {/* After Image */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-lavender/20 to-coral/20 shadow-md">
            {example.after ? (
              <img
                src={example.after}
                alt="Sticker result"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-coral text-xs">
                Sticker
              </div>
            )}

            {/* Sparkle decoration */}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400"
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: index * 0.3
              }}
            >
              <Sparkles className="w-4 h-4 fill-yellow-400" />
            </motion.div>
          </div>

          {/* Label */}
          {example.label && (
            <span className="text-xs text-slate-500 absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {example.label}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Single before/after comparison (larger format)
export function BeforeAfterSingle({
  before,
  after,
  className,
}: {
  before: string;
  after: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-center justify-center gap-4', className)}
    >
      <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 shadow-lg">
        <img
          src={before}
          alt="Original photo"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-slate-600">
          Before
        </div>
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <ArrowRight className="w-6 h-6 text-coral" />
      </motion.div>

      <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-lavender/30 to-coral/30 shadow-lg">
        <img
          src={after}
          alt="Sticker result"
          className="w-full h-full object-contain p-2"
        />
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-coral/80 backdrop-blur-sm rounded-full text-xs font-medium text-white">
          After
        </div>
      </div>
    </motion.div>
  );
}
