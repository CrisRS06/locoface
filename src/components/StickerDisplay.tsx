'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, CreditCard } from 'lucide-react';
import { Button } from './ui/Button';

interface StickerDisplayProps {
    imageUrl: string | null;
    previewId?: string;
}

export function StickerDisplay({ imageUrl, previewId }: StickerDisplayProps) {
    const [isBuying, setIsBuying] = React.useState(false);

    const handleBuy = async () => {
        if (!previewId) return;
        setIsBuying(true);
        try {
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ previewId }),
            });
            const data = await response.json();
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }
        } catch (error) {
            console.error('Buy error:', error);
        } finally {
            setIsBuying(false);
        }
    };

    if (!imageUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto mt-8 p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
        >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-6 group">
                <img
                    src={imageUrl}
                    alt="Generated Sticker"
                    className="w-full h-full object-contain p-4"
                />
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={handleBuy}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25"
                    isLoading={isBuying}
                >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Get HD ($1.99)
                </Button>

                <Button variant="secondary" onClick={() => {
                    if (navigator.share) {
                        navigator.share({
                            title: 'My AI Sticker',
                            text: 'Check out this sticker I made!',
                            url: imageUrl
                        });
                    }
                }}>
                    <Share2 className="h-5 w-5" />
                </Button>
            </div>

            <p className="text-xs text-center text-slate-500 mt-4">
                Preview has watermark. Purchase to unlock HD.
            </p>
        </motion.div>
    );
}
