'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLMotionProps<"button"> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'coral' | 'lavender';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, isLoading, variant = 'primary', size = 'md', glow, disabled, ...props }, ref) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center rounded-2xl font-semibold",
      "transition-all duration-200 ease-out",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
      "active:scale-[0.98]",
      "min-h-[44px]", // Touch target minimum (Apple HIG)
      "ripple-effect" // CSS ripple effect
    );

    const variants = {
      primary: cn(
        "bg-gradient-to-r from-slate-800 to-slate-900 text-white",
        "hover:from-slate-700 hover:to-slate-800",
        "shadow-lg shadow-slate-900/20",
        "focus-visible:ring-slate-500"
      ),
      secondary: cn(
        "bg-white text-slate-800 border border-slate-200",
        "hover:bg-slate-50 hover:border-slate-300",
        "shadow-sm",
        "focus-visible:ring-slate-400"
      ),
      outline: cn(
        "border-2 border-slate-300 text-slate-700 bg-transparent",
        "hover:bg-slate-50 hover:border-slate-400",
        "focus-visible:ring-slate-400"
      ),
      ghost: cn(
        "text-slate-600 bg-transparent",
        "hover:bg-slate-100 hover:text-slate-900",
        "focus-visible:ring-slate-400"
      ),
      coral: cn(
        "bg-gradient-to-r from-coral to-coral-light text-white font-bold",
        "hover:from-coral-dark hover:to-coral",
        "border-2 border-white/30",
        glow ? "shadow-lg shadow-coral/40 hover:shadow-xl hover:shadow-coral/50" : "shadow-md",
        "focus-visible:ring-coral"
      ),
      lavender: cn(
        "bg-gradient-to-r from-lavender to-lavender-dark text-slate-800 font-bold",
        "hover:from-lavender-dark hover:to-lavender",
        "border-2 border-white/30",
        glow ? "shadow-lg shadow-lavender/40 hover:shadow-xl hover:shadow-lavender/50" : "shadow-md",
        "focus-visible:ring-lavender-dark"
      ),
    };

    const sizes = {
      sm: "px-4 py-2 text-sm min-h-[36px]",
      md: "px-6 py-3 text-base min-h-[44px]",
      lg: "px-8 py-4 text-lg min-h-[52px]",
      xl: "px-10 py-5 text-xl min-h-[60px] rounded-3xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        )}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
