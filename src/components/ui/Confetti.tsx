'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
}

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#E5DEFF', // lavender
  '#FFC8DD', // soft-pink
  '#FFB5A7', // coral
  '#D4E7C5', // dusty-lime
  '#FFEAA7', // yellow
];

export function Confetti({
  trigger,
  duration = 3000,
  particleCount = 50,
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
      });
    }
    return newParticles;
  }, [particleCount, colors]);

  useEffect(() => {
    if (trigger) {
      setParticles(createParticles());

      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, createParticles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-sm"
            style={{
              left: `${particle.x}%`,
              top: -20,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            initial={{
              y: -20,
              opacity: 1,
              rotate: particle.rotation,
              scale: 1,
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
              opacity: 0,
              rotate: particle.rotation + 720,
              x: (Math.random() - 0.5) * 200,
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 2.5 + Math.random(),
              delay: particle.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Simpler sparkle burst effect for smaller celebrations
export function SparkleBurst({
  trigger,
  x,
  y,
  count = 8,
}: {
  trigger: boolean;
  x: number;
  y: number;
  count?: number;
}) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; angle: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newSparkles = Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (i / count) * 360,
      }));
      setSparkles(newSparkles);

      const timer = setTimeout(() => setSparkles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger, count]);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {sparkles.map((sparkle) => {
          const radians = (sparkle.angle * Math.PI) / 180;
          const distance = 60;
          const endX = Math.cos(radians) * distance;
          const endY = Math.sin(radians) * distance;

          return (
            <motion.div
              key={sparkle.id}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: endX,
                y: endY,
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
              exit={{ opacity: 0 }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
