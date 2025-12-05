'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'elevated' | 'subtle';
  glow?: 'coral' | 'lavender' | 'none';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function GlassCard({
  className,
  variant = 'default',
  glow = 'none',
  interactive = false,
  padding = 'md',
  children,
  ...props
}: GlassCardProps) {
  const variants = {
    default: 'glass',
    elevated: 'glass shadow-lg',
    subtle: 'glass-subtle',
  };

  const glowStyles = {
    coral: 'shadow-coral/20 hover:shadow-coral/30',
    lavender: 'shadow-lavender/20 hover:shadow-lavender/30',
    none: '',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      className={cn(
        'rounded-3xl',
        variants[variant],
        glowStyles[glow],
        paddingStyles[padding],
        interactive && 'card-interactive cursor-pointer',
        className
      )}
      whileHover={interactive ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
