'use client';

import { useCallback, useState } from 'react';

interface UseLemonSqueezyOptions {
  onError?: (error: unknown) => void;
}

/**
 * Lemon Squeezy hook - Uses full page redirect for Apple Pay support
 * Apple Pay only works with full redirects, not overlays
 */
export function useLemonSqueezy({ onError }: UseLemonSqueezyOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  // Always ready since we use redirect (no SDK needed)
  const isReady = true;

  const openCheckout = useCallback(
    (checkoutUrl: string) => {
      if (!checkoutUrl) {
        onError?.(new Error('No checkout URL provided'));
        return;
      }

      setIsLoading(true);

      try {
        // Full page redirect enables Apple Pay, Google Pay, and all payment methods
        window.location.href = checkoutUrl;
      } catch (error) {
        setIsLoading(false);
        console.error('Error redirecting to checkout:', error);
        onError?.(error);
      }
    },
    [onError]
  );

  const closeCheckout = useCallback(() => {
    // No-op for redirect mode (user uses browser back button)
    setIsLoading(false);
  }, []);

  return {
    isReady,
    isLoading,
    openCheckout,
    closeCheckout,
  };
}
