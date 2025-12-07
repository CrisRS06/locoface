'use client';

import { motion } from 'framer-motion';

// Santa Hat SVG Component
export function SantaHat({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`santa-hat ${className}`}
      initial={{ rotate: -5 }}
    >
      {/* Hat body */}
      <path
        d="M10 50 L32 15 L54 50 Q32 55 10 50"
        fill="#D42426"
        stroke="#B01E20"
        strokeWidth="2"
      />
      {/* White trim */}
      <ellipse cx="32" cy="50" rx="24" ry="6" fill="#FFFAFA" />
      {/* Pompom */}
      <circle cx="32" cy="12" r="6" fill="#FFFAFA" />
      {/* Highlight */}
      <path
        d="M20 35 Q25 25 30 20"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}

// Christmas Ornament Ball
export function Ornament({
  size = 24,
  color = 'red',
  className = '',
}: {
  size?: number;
  color?: 'red' | 'gold' | 'green' | 'blue';
  className?: string;
}) {
  const colors = {
    red: { main: '#D42426', dark: '#B01E20', shine: '#E85456' },
    gold: { main: '#FFD700', dark: '#DAA520', shine: '#FFE44D' },
    green: { main: '#165B33', dark: '#0D3D22', shine: '#1E7B46' },
    blue: { main: '#4A90D9', dark: '#3672B0', shine: '#6AAAE5' },
  };

  const c = colors[color];

  return (
    <motion.svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 24 32"
      className={`ornament ${className}`}
    >
      {/* Hook */}
      <path
        d="M12 0 L12 4 M10 2 Q12 0 14 2"
        stroke="#C0C0C0"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cap */}
      <rect x="9" y="4" width="6" height="3" rx="1" fill="#C0C0C0" />
      {/* Ball */}
      <circle cx="12" cy="18" r="10" fill={c.main} />
      {/* Shine */}
      <ellipse
        cx="9"
        cy="14"
        rx="3"
        ry="4"
        fill={c.shine}
        opacity="0.6"
        className="ornament-shine"
      />
      {/* Decorative band */}
      <path
        d="M5 18 Q12 22 19 18"
        stroke={c.dark}
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
    </motion.svg>
  );
}

// Holly Leaf with Berries
export function HollyLeaf({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      {/* Left leaf */}
      <path
        d="M16 16 Q8 8 4 16 Q8 12 12 16 Q8 20 4 16 Q8 24 16 16"
        fill="#165B33"
        stroke="#0D3D22"
        strokeWidth="0.5"
      />
      {/* Right leaf */}
      <path
        d="M16 16 Q24 8 28 16 Q24 12 20 16 Q24 20 28 16 Q24 24 16 16"
        fill="#1E7B46"
        stroke="#165B33"
        strokeWidth="0.5"
      />
      {/* Berries */}
      <circle cx="14" cy="16" r="2.5" fill="#D42426" />
      <circle cx="18" cy="16" r="2.5" fill="#D42426" />
      <circle cx="16" cy="13" r="2.5" fill="#B01E20" />
      {/* Berry shine */}
      <circle cx="13.5" cy="15" r="0.8" fill="white" opacity="0.6" />
      <circle cx="17.5" cy="15" r="0.8" fill="white" opacity="0.6" />
      <circle cx="15.5" cy="12" r="0.8" fill="white" opacity="0.6" />
    </svg>
  );
}

// Christmas Light Bulb
export function ChristmasLightBulb({
  color = 'red',
  size = 16,
}: {
  color?: 'red' | 'green' | 'gold' | 'blue';
  size?: number;
}) {
  const colors = {
    red: '#D42426',
    green: '#1E7B46',
    gold: '#FFD700',
    blue: '#4A90D9',
  };

  const colorClasses = {
    red: 'christmas-light-red',
    green: 'christmas-light-green',
    gold: 'christmas-light-gold',
    blue: 'christmas-light-blue',
  };

  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 16 24"
      className={`christmas-light ${colorClasses[color]}`}
    >
      {/* Socket */}
      <rect x="5" y="0" width="6" height="4" rx="1" fill="#4A4A4A" />
      {/* Bulb */}
      <ellipse cx="8" cy="14" rx="6" ry="8" fill={colors[color]} />
      {/* Glow effect */}
      <ellipse
        cx="8"
        cy="14"
        rx="4"
        ry="6"
        fill="white"
        opacity="0.3"
      />
    </svg>
  );
}

// Christmas Lights Garland
export function ChristmasLights({ className = '' }: { className?: string }) {
  const lightColors: Array<'red' | 'green' | 'gold' | 'blue'> = ['red', 'green', 'gold', 'blue'];

  return (
    <div className={`flex items-start justify-center gap-1 ${className}`}>
      {/* Wire */}
      <svg
        className="absolute top-0 left-0 w-full h-8 pointer-events-none"
        viewBox="0 0 400 30"
        preserveAspectRatio="none"
      >
        <path
          d="M0 5 Q50 20 100 5 Q150 20 200 5 Q250 20 300 5 Q350 20 400 5"
          stroke="#2D2D2D"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      {/* Bulbs */}
      <div className="flex gap-6 pt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: i % 2 === 0 ? 0 : 8 }}
            animate={{
              y: i % 2 === 0 ? [0, 4, 0] : [8, 12, 8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
          >
            <ChristmasLightBulb
              color={lightColors[i % 4]}
              size={14}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Snowflake decoration (static, for floating)
export function SnowflakeDecor({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      {/* Main cross */}
      <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Diagonal lines */}
      <line x1="5" y1="5" x2="19" y2="19" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="19" y1="5" x2="5" y2="19" stroke="white" strokeWidth="1" strokeLinecap="round" />
      {/* Branches */}
      <line x1="12" y1="5" x2="9" y2="2" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="12" y1="5" x2="15" y2="2" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="12" y1="19" x2="9" y2="22" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="12" y1="19" x2="15" y2="22" stroke="white" strokeWidth="1" strokeLinecap="round" />
      {/* Side branches */}
      <line x1="5" y1="12" x2="2" y2="9" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="5" y1="12" x2="2" y2="15" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="9" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="15" stroke="white" strokeWidth="1" strokeLinecap="round" />
      {/* Center crystal */}
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.8" />
    </svg>
  );
}

// Gift Box decoration
export function GiftBox({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      {/* Box */}
      <rect x="4" y="12" width="24" height="18" rx="2" fill="#D42426" />
      {/* Lid */}
      <rect x="2" y="8" width="28" height="6" rx="2" fill="#B01E20" />
      {/* Ribbon vertical */}
      <rect x="14" y="8" width="4" height="22" fill="#FFD700" />
      {/* Ribbon horizontal */}
      <rect x="2" y="9" width="28" height="3" fill="#FFD700" />
      {/* Bow */}
      <ellipse cx="12" cy="6" rx="4" ry="3" fill="#FFD700" />
      <ellipse cx="20" cy="6" rx="4" ry="3" fill="#FFD700" />
      <circle cx="16" cy="7" r="2" fill="#DAA520" />
    </svg>
  );
}

// Candy Cane
export function CandyCane({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 24 30" className={className}>
      <defs>
        <pattern id="candy-stripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#D42426" />
          <rect x="3" width="3" height="6" fill="white" />
        </pattern>
      </defs>
      {/* Cane shape */}
      <path
        d="M12 30 L12 12 Q12 4 18 4 Q24 4 24 10"
        stroke="url(#candy-stripes)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Floating Christmas Decorations (replacement for regular floating decorations)
export function FloatingChristmasDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top left ornament */}
      <motion.div
        className="absolute top-20 left-[10%]"
        animate={{
          y: [0, 15, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Ornament size={28} color="red" />
      </motion.div>

      {/* Top right snowflake */}
      <motion.div
        className="absolute top-32 right-[15%]"
        animate={{
          y: [0, 10, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <SnowflakeDecor size={24} className="opacity-60" />
      </motion.div>

      {/* Left side holly */}
      <motion.div
        className="absolute top-1/3 left-[5%]"
        animate={{
          y: [0, 8, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <HollyLeaf size={36} />
      </motion.div>

      {/* Right side gold ornament */}
      <motion.div
        className="absolute top-1/2 right-[8%]"
        animate={{
          y: [0, 12, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Ornament size={32} color="gold" />
      </motion.div>

      {/* Bottom left gift */}
      <motion.div
        className="absolute bottom-40 left-[12%]"
        animate={{
          y: [0, 6, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <GiftBox size={28} />
      </motion.div>

      {/* Bottom right green ornament */}
      <motion.div
        className="absolute bottom-32 right-[10%]"
        animate={{
          y: [0, 10, 0],
          rotate: [-4, 4, -4],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        <Ornament size={26} color="green" />
      </motion.div>

      {/* Center-left candy cane */}
      <motion.div
        className="absolute top-2/3 left-[18%]"
        animate={{
          rotate: [-10, 10, -10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <CandyCane size={24} />
      </motion.div>

      {/* Top center snowflake */}
      <motion.div
        className="absolute top-16 left-1/2 -translate-x-1/2"
        animate={{
          y: [0, 8, 0],
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <SnowflakeDecor size={20} className="opacity-50" />
      </motion.div>
    </div>
  );
}
