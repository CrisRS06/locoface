'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChristmasContextType {
  isChristmas: boolean;
  toggleChristmas: () => void;
}

const ChristmasContext = createContext<ChristmasContextType | undefined>(undefined);

const STORAGE_KEY = 'locoface-christmas-mode';

export function ChristmasProvider({ children }: { children: ReactNode }) {
  const [isChristmas, setIsChristmas] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsChristmas(true);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage when state changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, String(isChristmas));
    }
  }, [isChristmas, isHydrated]);

  // Add/remove class on body for global CSS theming
  useEffect(() => {
    if (isHydrated) {
      if (isChristmas) {
        document.body.classList.add('christmas-mode');
      } else {
        document.body.classList.remove('christmas-mode');
      }
    }
  }, [isChristmas, isHydrated]);

  const toggleChristmas = () => {
    setIsChristmas(prev => !prev);
  };

  return (
    <ChristmasContext.Provider value={{ isChristmas, toggleChristmas }}>
      {children}
    </ChristmasContext.Provider>
  );
}

export function useChristmas() {
  const context = useContext(ChristmasContext);
  if (context === undefined) {
    throw new Error('useChristmas must be used within a ChristmasProvider');
  }
  return context;
}
