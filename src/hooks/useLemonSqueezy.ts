'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UseLemonSqueezyOptions {
  onSuccess?: (data: Record<string, unknown>) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

export function useLemonSqueezy({
  onSuccess,
  onClose,
  onError,
}: UseLemonSqueezyOptions = {}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    // Wait for LemonSqueezy script to load
    const initLemonSqueezy = () => {
      if (typeof window === 'undefined') return;

      // Initialize LemonSqueezy
      if (window.createLemonSqueezy && !initialized.current) {
        window.createLemonSqueezy();
        initialized.current = true;
      }

      // Setup event handler
      if (window.LemonSqueezy) {
        window.LemonSqueezy.Setup({
          eventHandler: (event: { event: string; data?: unknown }) => {
            switch (event.event) {
              case 'Checkout.Success':
                onSuccess?.((event.data as Record<string, unknown>) || {});
                break;
              case 'Checkout.Closed':
              case 'PaymentMethodUpdate.Closed':
                onClose?.();
                break;
              default:
                // Handle other events if needed
                break;
            }
          },
        });
      }
    };

    // Try to initialize immediately
    initLemonSqueezy();

    // Also listen for script load event as backup
    const handleScriptLoad = () => {
      initLemonSqueezy();
    };

    window.addEventListener('load', handleScriptLoad);

    return () => {
      window.removeEventListener('load', handleScriptLoad);
    };
  }, [onSuccess, onClose]);

  const openCheckout = useCallback(
    (checkoutUrl: string) => {
      if (typeof window === 'undefined') return;

      // Add embed=1 to URL for overlay mode if not already present
      const url = new URL(checkoutUrl);
      if (!url.searchParams.has('embed')) {
        url.searchParams.set('embed', '1');
      }

      try {
        if (window.LemonSqueezy?.Url) {
          // Use overlay
          window.LemonSqueezy.Url.Open(url.toString());
        } else {
          // Fallback to redirect
          console.warn('LemonSqueezy not initialized, falling back to redirect');
          window.location.href = url.toString();
        }
      } catch (error) {
        console.error('Error opening checkout:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to open checkout'));
        // Fallback to redirect
        window.location.href = url.toString();
      }
    },
    [onError]
  );

  const closeCheckout = useCallback(() => {
    if (typeof window !== 'undefined' && window.LemonSqueezy?.Url) {
      window.LemonSqueezy.Url.Close();
    }
  }, []);

  return {
    openCheckout,
    closeCheckout,
    isReady: typeof window !== 'undefined' && !!window.LemonSqueezy,
  };
}
