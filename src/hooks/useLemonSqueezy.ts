'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

interface UseLemonSqueezyOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

declare global {
  interface Window {
    LemonSqueezy?: {
      Setup: (config: { eventHandler: (event: LemonSqueezyEvent) => void }) => void;
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
    };
    createLemonSqueezy?: () => void;
  }
}

interface LemonSqueezyEvent {
  event:
    | 'Checkout.Success'
    | 'Checkout.Closed'
    | 'PaymentMethodUpdate.Created'
    | 'PaymentMethodUpdate.Updated'
    | 'PaymentMethodUpdate.Closed';
  data?: {
    order?: {
      id: string;
      identifier: string;
      order_number: number;
      user_name: string;
      user_email: string;
      currency: string;
      total: number;
      total_formatted: string;
    };
  };
}

export function useLemonSqueezy({ onSuccess, onError }: UseLemonSqueezyOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialized = useRef(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check if script already exists
    if (document.querySelector('script[src="https://app.lemonsqueezy.com/js/lemon.js"]')) {
      if (window.LemonSqueezy) {
        setIsReady(true);
        scriptLoaded.current = true;
      }
      return;
    }

    // Load Lemon Squeezy script
    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.defer = true;
    script.onload = () => {
      // Initialize Lemon Squeezy
      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }
      setIsReady(true);
      scriptLoaded.current = true;
    };
    script.onerror = () => {
      console.error('Failed to load Lemon Squeezy SDK');
      onError?.(new Error('Failed to load payment SDK'));
    };
    document.head.appendChild(script);
  }, [onError]);

  // Setup event handler when SDK is ready
  useEffect(() => {
    if (!isReady || !window.LemonSqueezy) return;

    window.LemonSqueezy.Setup({
      eventHandler: (event: LemonSqueezyEvent) => {
        if (event.event === 'Checkout.Success') {
          setIsLoading(false);
          onSuccess?.();
        } else if (event.event === 'Checkout.Closed') {
          setIsLoading(false);
        }
      }
    });
  }, [isReady, onSuccess]);

  const openCheckout = useCallback(
    (checkoutUrl: string) => {
      if (!window.LemonSqueezy) {
        console.error('Lemon Squeezy SDK not loaded');
        onError?.(new Error('Payment SDK not ready'));
        return;
      }

      setIsLoading(true);

      try {
        window.LemonSqueezy.Url.Open(checkoutUrl);
      } catch (error) {
        setIsLoading(false);
        console.error('Error opening checkout:', error);
        onError?.(error);
      }
    },
    [onError]
  );

  const closeCheckout = useCallback(() => {
    if (window.LemonSqueezy) {
      window.LemonSqueezy.Url.Close();
      setIsLoading(false);
    }
  }, []);

  return {
    isReady,
    isLoading,
    openCheckout,
    closeCheckout,
  };
}
