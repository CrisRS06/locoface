'use client';

import { useMemo } from 'react';

interface SnowflakeProps {
  style: React.CSSProperties;
}

function Snowflake({ style }: SnowflakeProps) {
  return <div className="snowflake" style={style} />;
}

export function Snowfall() {
  // Generate snowflakes with random properties
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const size = Math.random() * 10 + 8; // 8-18px
      const left = Math.random() * 100; // 0-100%
      const animationDuration = Math.random() * 10 + 8; // 8-18s
      const animationDelay = Math.random() * -15; // Stagger start
      const opacity = Math.random() * 0.4 + 0.4; // 0.4-0.8

      return {
        id: i,
        style: {
          left: `${left}%`,
          fontSize: `${size}px`,
          opacity,
          animationDuration: `${animationDuration}s`,
          animationDelay: `${animationDelay}s`,
        } as React.CSSProperties,
      };
    });
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-50"
      aria-hidden="true"
    >
      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} style={flake.style} />
      ))}
    </div>
  );
}
