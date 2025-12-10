'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'es' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <motion.button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${locale === 'en' ? 'Spanish' : 'English'}`}
    >
      <Globe className="w-4 h-4 text-slate-600" />
      <span className="text-sm font-medium text-slate-700">
        {locale === 'en' ? 'ES' : 'EN'}
      </span>
    </motion.button>
  );
}
