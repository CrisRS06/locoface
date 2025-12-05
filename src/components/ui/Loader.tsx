'use client';

import { motion } from 'framer-motion';

export function Loader() {
    return (
        <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-600 rounded-full"
                    animate={{
                        y: ["0%", "-50%", "0%"],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
