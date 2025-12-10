'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { DoodleStar, DoodleHeart } from './Decorations';
import { useChristmas } from '@/contexts/ChristmasContext';

interface Example {
  before: string;
  after: string;
}

const EXAMPLES: Example[] = [
  { before: '/examples/a.png', after: '/examples/as.png' },
  { before: '/examples/b.png', after: '/examples/bs.png' },
  { before: '/examples/c.png', after: '/examples/cs.png' },
  { before: '/examples/d.png', after: '/examples/ds.png' },
  { before: '/examples/e.png', after: '/examples/es.png' },
  { before: '/examples/f.png', after: '/examples/fs.png' },
];

// Timing configuration (ms)
const SHOW_PHOTO_TIME = 1500;    // Show photo
const SHOW_STICKER_TIME = 2000;  // Show sticker
const FLIP_DURATION = 600;       // Flip animation

export function HeroShowcase() {
  const { isChristmas } = useChristmas();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple animation cycle
  useEffect(() => {
    const runCycle = () => {
      // Step 1: Show photo for a bit, then flip to sticker
      timeoutRef.current = setTimeout(() => {
        setIsFlipped(true);

        // Step 2: Show sticker, then go to next
        timeoutRef.current = setTimeout(() => {
          setIsFlipped(false);

          // Step 3: Brief pause then change to next example
          timeoutRef.current = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % EXAMPLES.length);
          }, FLIP_DURATION);

        }, SHOW_STICKER_TIME);

      }, SHOW_PHOTO_TIME);
    };

    runCycle();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex]);

  const currentExample = EXAMPLES[currentIndex];

  // Use Christmas version of stickers when Christmas mode is active
  const afterImage = isChristmas
    ? currentExample.after.replace('.png', 'c.png')
    : currentExample.after;

  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[380px] mx-auto">
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-4 -left-4 z-10"
        animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <DoodleStar size={28} className="text-star-green" />
      </motion.div>

      <motion.div
        className="absolute -top-2 -right-6 z-10"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        <DoodleHeart size={22} className="text-coral-light" filled />
      </motion.div>

      <motion.div
        className="absolute -bottom-3 -left-6 z-10"
        animate={{ rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <DoodleHeart size={18} className="text-heart-mint" />
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -right-3 z-10"
        animate={{ rotate: [0, 15, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
      >
        <DoodleStar size={22} className="text-lavender-dark" />
      </motion.div>

      {/* Main flip card container */}
      <div className="flip-card w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] mx-auto">
        <div className={`flip-card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
          {/* Front - Original Photo */}
          <div className="flip-card-front absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-white p-2 rounded-3xl">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`before-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={currentExample.before}
                      alt="Original photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 280px, 340px"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Back - Sticker Result */}
          <div className="flip-card-back absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lavender/30 via-white to-coral/20 p-2 rounded-3xl">
              <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`after-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={afterImage}
                      alt="Sticker result"
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 640px) 280px, 340px"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
