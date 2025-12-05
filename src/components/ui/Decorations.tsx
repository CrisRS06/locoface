'use client';

import { motion } from 'framer-motion';

// Star decoration like in the logo
export function DoodleStar({
  className = '',
  size = 24,
  filled = true
}: {
  className?: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      className={`doodle-star ${className}`}
    >
      <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
    </svg>
  );
}

// Heart decoration
export function DoodleHeart({
  className = '',
  size = 20,
  filled = false
}: {
  className?: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      className={`doodle-heart ${className}`}
    >
      <path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 14 21 14 21"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Spiral decoration like in the logo
export function DoodleSpiral({
  className = '',
  size = 32
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className={`doodle-spiral ${className}`}
    >
      <path d="M16 16C16 14.5 17.5 13 19 13C21 13 23 15 23 17C23 20 20 23 16 23C11 23 7 19 7 14C7 8 12 3 18 3" />
    </svg>
  );
}

// Small decorative stars cluster
export function StarCluster({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <DoodleStar size={16} className="text-star-green" />
      <DoodleStar size={10} className="text-lavender-dark absolute -top-1 -right-3" />
    </div>
  );
}

// Floating decorations that animate
export function FloatingDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top left star */}
      <motion.div
        className="absolute top-20 left-[10%]"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <DoodleStar size={28} className="text-star-green" />
      </motion.div>

      {/* Top right hearts */}
      <motion.div
        className="absolute top-32 right-[15%]"
        animate={{ y: [0, 8, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <DoodleHeart size={18} className="text-heart-mint" filled />
      </motion.div>

      <motion.div
        className="absolute top-24 right-[12%]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <DoodleHeart size={12} className="text-soft-pink" />
      </motion.div>

      {/* Left side small star */}
      <motion.div
        className="absolute top-1/2 left-[5%]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <DoodleStar size={16} className="text-lavender-dark" filled={false} />
      </motion.div>

      {/* Bottom decorations */}
      <motion.div
        className="absolute bottom-40 left-[20%]"
        animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <DoodleStar size={20} className="text-tape-purple" />
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-[25%]"
        animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
      >
        <DoodleHeart size={14} className="text-coral-light" filled />
      </motion.div>
    </div>
  );
}

// Washi tape style badge
export function WashiTapeBadge({
  children,
  variant = 'purple',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'purple' | 'coral';
  className?: string;
}) {
  const bgColor = variant === 'purple' ? 'bg-tape-purple' : 'bg-coral-light';
  const rotation = variant === 'purple' ? '-rotate-2' : 'rotate-2';

  return (
    <span className={`inline-block px-4 py-1.5 ${bgColor} ${rotation} text-slate-700 text-sm font-medium rounded-sm shadow-sm ${className}`}>
      {children}
    </span>
  );
}
