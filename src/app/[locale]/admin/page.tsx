'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, Copy, Check, LogOut, Sparkles, Gift, RefreshCw, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { loginAction, logoutAction, generateCodesAction, getExistingCodesAction } from './actions';
import Link from 'next/link';

interface PromoCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [quantity, setQuantity] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [existingCodes, setExistingCodes] = useState<PromoCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const result = await getExistingCodesAction();
      if (result.success) {
        setIsAuthenticated(true);
        setExistingCodes(result.codes || []);
      }
    } catch {
      // Not authenticated
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const result = await loginAction(password);

    if (result.success) {
      setIsAuthenticated(true);
      setPassword('');
      // Fetch existing codes after login
      const codesResult = await getExistingCodesAction();
      if (codesResult.success) {
        setExistingCodes(codesResult.codes || []);
      }
    } else {
      setLoginError(result.error || 'Login failed');
    }

    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logoutAction();
    setIsAuthenticated(false);
    setGeneratedCodes([]);
    setExistingCodes([]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateCodesAction(quantity);

    if (result.success && result.codes) {
      setGeneratedCodes(result.codes);
      // Refresh existing codes
      const codesResult = await getExistingCodesAction();
      if (codesResult.success) {
        setExistingCodes(codesResult.codes || []);
      }
    }

    setIsGenerating(false);
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAllCodes = async () => {
    const allCodes = generatedCodes.join('\n');
    await navigator.clipboard.writeText(allCodes);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const refreshCodes = async () => {
    const result = await getExistingCodesAction();
    if (result.success) {
      setExistingCodes(result.codes || []);
    }
  };

  const [isPrintingSheet, setIsPrintingSheet] = useState(false);

  const printCodeSheet = async () => {
    setIsPrintingSheet(true);

    // Generar 30 códigos nuevos
    const result = await generateCodesAction(30);

    if (!result.success || !result.codes) {
      setIsPrintingSheet(false);
      return;
    }

    const newCodes = result.codes;

    const COLS = 5;
    const ROWS = 6;

    // Generar HTML para cada tarjeta
    const generateCard = (code: string) => `
      <div style="
        border: 1px dashed #ccc;
        padding: 8px 4px;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        box-sizing: border-box;
      ">
        <div style="
          font-family: 'Courier New', monospace;
          font-size: 11px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        ">${code}</div>
        <div style="
          font-size: 8px;
          color: #666;
          line-height: 1.2;
        ">1 sticker gratis en<br/>locoface.com</div>
      </div>
    `;

    // Generar la página con los 30 códigos
    const cards = newCodes.map(code => generateCard(code)).join('');

    const page = `
      <div style="
        display: grid;
        grid-template-columns: repeat(${COLS}, 1fr);
        grid-template-rows: repeat(${ROWS}, 1fr);
        gap: 0;
        width: 8.5in;
        height: 11in;
        padding: 0.25in;
        box-sizing: border-box;
      ">
        ${cards}
      </div>
    `;

    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setIsPrintingSheet(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LocoFace - Códigos Promocionales</title>
          <style>
            @page {
              size: letter;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
            }
            body {
              font-family: Arial, sans-serif;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${page}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Esperar a que cargue y luego imprimir
    setTimeout(() => {
      printWindow.print();
    }, 250);

    // Refrescar lista de códigos existentes
    const codesResult = await getExistingCodesAction();
    if (codesResult.success) {
      setExistingCodes(codesResult.codes || []);
    }

    setIsPrintingSheet(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg-soft flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <GlassCard variant="elevated" padding="lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-coral" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Access</h1>
              <p className="text-sm text-slate-500 mt-1">Enter password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
                autoFocus
              />

              <AnimatePresence>
                {loginError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-500 text-center"
                  >
                    {loginError}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                variant="coral"
                size="lg"
                className="w-full"
                disabled={isLoggingIn || !password}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <Link
              href="/"
              className="block text-center text-sm text-slate-500 hover:text-coral mt-4 transition-colors"
            >
              &larr; Back to app
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen gradient-bg-soft p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-coral" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">LocoFace Admin</h1>
              <p className="text-sm text-slate-500">Promo Code Generator</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        {/* Generate New Codes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard variant="elevated" padding="lg" className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-coral" />
              Generate New Codes
            </h2>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-slate-600 mb-1 block">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="coral"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Codes */}
            <AnimatePresence>
              {generatedCodes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-700">
                      Generated {generatedCodes.length} codes:
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={copyAllCodes}
                    >
                      {copiedAll ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy All
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">
                    {generatedCodes.map((code) => (
                      <div
                        key={code}
                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100"
                      >
                        <code className="font-mono text-sm text-slate-800">{code}</code>
                        <button
                          onClick={() => copyToClipboard(code)}
                          className="text-slate-400 hover:text-coral transition-colors p-1"
                        >
                          {copiedCode === code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Existing Codes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Existing Codes
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({existingCodes.filter(c => c.current_uses < c.max_uses && c.is_active).length} available)
                </span>
              </h2>
              <button
                onClick={printCodeSheet}
                disabled={isPrintingSheet}
                className="text-slate-400 hover:text-coral transition-colors p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Generar 30 códigos e imprimir hoja"
              >
                {isPrintingSheet ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={refreshCodes}
                className="text-slate-400 hover:text-coral transition-colors p-2"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {existingCodes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No codes yet. Generate some above!
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {existingCodes.map((promo) => {
                  const isUsed = promo.current_uses >= promo.max_uses;
                  const isAvailable = !isUsed && promo.is_active;

                  return (
                    <div
                      key={promo.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                        isAvailable
                          ? 'bg-green-50 border-green-100'
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <code className="font-mono text-sm text-slate-800">{promo.code}</code>
                        {isUsed && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                            Used
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {promo.current_uses}/{promo.max_uses}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-coral transition-colors"
          >
            &larr; Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
