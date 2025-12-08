'use client';

import { motion } from 'framer-motion';
import { useChristmas } from '@/contexts/ChristmasContext';

export function ChristmasToggle() {
  const { isChristmas, toggleChristmas } = useChristmas();

  return (
    <motion.button
      onClick={toggleChristmas}
      className="group relative flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300"
      style={{
        background: isChristmas
          ? 'linear-gradient(135deg, #D42426 0%, #165B33 100%)'
          : 'rgba(255, 255, 255, 0.8)',
        boxShadow: isChristmas
          ? '0 4px 20px rgba(212, 36, 38, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      role="switch"
      aria-checked={isChristmas}
      aria-label="Toggle Christmas Mode"
    >
      {/* Icon container */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Snowflake (OFF state) */}
        <motion.span
          className="absolute text-lg"
          initial={false}
          animate={{
            opacity: isChristmas ? 0 : 1,
            scale: isChristmas ? 0.5 : 1,
            rotate: isChristmas ? -90 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          ❄️
        </motion.span>

        {/* Christmas Tree (ON state) */}
        <motion.span
          className="absolute text-lg"
          initial={false}
          animate={{
            opacity: isChristmas ? 1 : 0,
            scale: isChristmas ? 1 : 0.5,
            rotate: isChristmas ? 0 : 90,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          🎄
        </motion.span>
      </div>

      {/* Label */}
      <span
        className={`text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
          isChristmas ? 'text-white' : 'text-slate-700'
        }`}
      >
        {isChristmas ? 'Christmas ON' : 'Christmas OFF'}
      </span>

      {/* Toggle indicator */}
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
          isChristmas ? 'bg-white/30' : 'bg-slate-200'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full shadow-md"
          style={{
            background: isChristmas
              ? 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)'
              : 'white',
          }}
          initial={false}
          animate={{
            x: isChristmas ? 22 : 2,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </div>

      {/* Sparkle effects when ON */}
      {isChristmas && (
        <>
          <motion.span
            className="absolute -top-1 -right-1 text-xs"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ✨
          </motion.span>
          <motion.span
            className="absolute -bottom-1 left-2 text-xs"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          >
            ⭐
          </motion.span>
        </>
      )}
    </motion.button>
  );
}
