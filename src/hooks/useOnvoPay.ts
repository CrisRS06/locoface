'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

interface UseOnvoPayOptions {
  onSuccess?: (data: OnvoPaymentResult) => void;
  onError?: (error: unknown) => void;
}

interface OnvoPaymentResult {
  status: string;
  paymentIntent?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}

declare global {
  interface Window {
    onvo?: {
      pay: (config: {
        publicKey: string;
        paymentIntentId: string;
        paymentType: string;
        customerId?: string;
        onSuccess: (data: unknown) => void;
        onError: (error: unknown) => void;
        locale?: 'es' | 'en';
      }) => {
        render: (selector: string) => void;
      };
    };
  }
}

export function useOnvoPay({ onSuccess, onError }: UseOnvoPayOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialized = useRef(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check if script already exists
    if (document.querySelector('script[src="https://sdk.onvopay.com/sdk.js"]')) {
      if (window.onvo) {
        setIsReady(true);
        scriptLoaded.current = true;
      }
      return;
    }

    // Load Onvo SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.onvopay.com/sdk.js';
    script.async = true;
    script.onload = () => {
      setIsReady(true);
      scriptLoaded.current = true;
    };
    script.onerror = () => {
      console.error('Failed to load Onvo SDK');
      onError?.(new Error('Failed to load payment SDK'));
    };
    document.head.appendChild(script);
  }, [onError]);

  const renderPaymentForm = useCallback(
    (paymentIntentId: string, containerId: string) => {
      if (!window.onvo) {
        console.error('Onvo SDK not loaded');
        onError?.(new Error('Payment SDK not ready'));
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_ONVO_PUBLIC_KEY;
      if (!publicKey) {
        console.error('NEXT_PUBLIC_ONVO_PUBLIC_KEY not configured');
        onError?.(new Error('Payment not configured'));
        return;
      }

      setIsLoading(true);

      try {
        window.onvo.pay({
          publicKey,
          paymentIntentId,
          paymentType: 'one_time',
          locale: 'en',
          onSuccess: (data) => {
            // ========== DIAGNOSTIC LOGS ==========
            console.log('=== ONVO SDK onSuccess FIRED ===');
            console.log('Raw data type:', typeof data);
            console.log('Raw data:', JSON.stringify(data, null, 2));

            // Check all possible status locations
            const dataAny = data as Record<string, unknown>;
            console.log('data.status:', dataAny?.status);
            console.log('data.paymentIntent:', dataAny?.paymentIntent);
            console.log('data.paymentIntent?.status:', (dataAny?.paymentIntent as Record<string, unknown>)?.status);
            console.log('Object.keys(data):', Object.keys(dataAny || {}));
            // ======================================

            setIsLoading(false);

            // Try multiple possible status locations
            const status =
              dataAny?.status ||
              (dataAny?.paymentIntent as Record<string, unknown>)?.status ||
              (dataAny?.data as Record<string, unknown>)?.status;

            console.log('Resolved status:', status);

            // IMPORTANT: onSuccess fires when confirmation is processed
            // Must check status to determine if payment actually succeeded
            if (status === 'succeeded') {
              console.log('STATUS IS SUCCEEDED - calling page onSuccess');
              onSuccess?.({ status: 'succeeded', paymentIntent: dataAny?.paymentIntent } as OnvoPaymentResult);
            } else if (status === 'requires_payment_method') {
              // Payment was declined
              console.log('PAYMENT DECLINED - requires_payment_method');
              onError?.(new Error('Payment was declined. Please try another card.'));
            } else if (status === 'requires_action') {
              // 3DS authentication needed - SDK handles this automatically
              console.log('3DS authentication in progress...');
            } else {
              console.log('UNKNOWN STATUS:', status);
              // If no status found, try calling onSuccess anyway to see what happens
              onSuccess?.({ status: status as string || 'unknown' } as OnvoPaymentResult);
            }
          },
          onError: (error) => {
            // ========== DIAGNOSTIC LOGS ==========
            console.log('=== ONVO SDK onError FIRED ===');
            console.log('Error type:', typeof error);
            console.log('Error:', JSON.stringify(error, null, 2));
            // Show alert for visibility during debugging
            if (typeof window !== 'undefined') {
              alert('ONVO ERROR: ' + JSON.stringify(error));
            }
            // ======================================

            setIsLoading(false);
            console.error('Onvo payment error:', error);
            onError?.(error);
          },
        }).render(containerId);
      } catch (error) {
        setIsLoading(false);
        console.error('Error rendering payment form:', error);
        onError?.(error);
      }
    },
    [onSuccess, onError]
  );

  return {
    isReady,
    isLoading,
    renderPaymentForm,
  };
}
