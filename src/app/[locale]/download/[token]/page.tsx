'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Download, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DownloadPage() {
    const params = useParams();
    const token = params.token as string;
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired'>('loading');
    const [hdUrl, setHdUrl] = useState<string | null>(null);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) return;

            const { data: order, error } = await supabase
                .from('orders')
                .select('hd_base64, download_expires_at')
                .eq('download_token', token)
                .single();

            if (error || !order) {
                setStatus('invalid');
                return;
            }

            if (new Date(order.download_expires_at) < new Date()) {
                setStatus('expired');
                return;
            }

            setHdUrl(order.hd_base64);
            setStatus('valid');
        };

        verifyToken();
    }, [token]);

    const handleDownload = () => {
        if (!hdUrl) return;
        const a = document.createElement('a');
        a.href = hdUrl;
        a.download = `sticker-hd-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (status === 'invalid' || status === 'expired') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Expired or Invalid</h1>
                    <p className="text-slate-600 mb-6">
                        This download link is no longer valid. Please check your email or contact support.
                    </p>
                    <Button onClick={() => window.location.href = '/'}>
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full text-center"
            >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
                <p className="text-slate-600 mb-8">
                    Your HD sticker is ready. It's watermark-free and high resolution.
                </p>

                {hdUrl && (
                    <div className="mb-8 relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={hdUrl} alt="HD Sticker" className="w-full h-full object-contain p-4" />
                    </div>
                )}

                <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700 shadow-green-500/25" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Download HD Sticker
                </Button>
            </motion.div>
        </div>
    );
}
