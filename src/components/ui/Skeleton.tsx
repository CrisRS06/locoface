'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    rounded: 'rounded-2xl',
  };

  return (
    <div
      className={cn(
        'animate-shimmer',
        variants[variant],
        className
      )}
      aria-hidden="true"
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass rounded-3xl p-6 space-y-4', className)}>
      <Skeleton variant="rounded" className="w-full aspect-square" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}

export function SkeletonSticker({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <Skeleton variant="rounded" className="w-64 h-64" />
      <Skeleton variant="text" className="w-32 h-4" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" className="w-24 h-10" />
        <Skeleton variant="rounded" className="w-24 h-10" />
      </div>
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton variant="rounded" className={cn('h-12 w-full', className)} />;
}
