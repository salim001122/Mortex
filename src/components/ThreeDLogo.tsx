import { motion } from 'motion/react';

interface ThreeDLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function ThreeDLogo({ size = 'md' }: ThreeDLogoProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-4 text-2xl'
  };

  return (
    <div className="flex items-center justify-center select-none">
      {/* Sleek, professional Mortex Investment Foundation tag as the logo */}
      <motion.div
        className={`font-mono font-black rounded-lg border border-cyan-800/40 bg-zinc-900 text-zinc-100 flex items-center gap-1.5 shadow-md ${sizeClasses[size]}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-cyan-400 font-bold">Mortex</span>
        <span className="tracking-tight">Investment<span className="text-cyan-400"> Foundation</span></span>
        <span
          className="w-1.5 h-3.5 bg-cyan-400 inline-block align-middle animate-pulse"
        />
      </motion.div>
    </div>
  );
}
