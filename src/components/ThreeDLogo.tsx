import { motion } from 'motion/react';

interface ThreeDLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function ThreeDLogo({ size = 'md', showText = true }: ThreeDLogoProps) {
  const sizeMap = {
    sm: { container: 'h-10 w-10', text: 'text-xs' },
    md: { container: 'h-20 w-20', text: 'text-base' },
    lg: { container: 'h-32 w-32', text: 'text-2xl' },
    xl: { container: 'h-48 w-48', text: 'text-4xl' },
  };

  const selectedSize = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center select-none gap-2">
      {/* 3D Glowing Cybernetic NGK Emblem */}
      <motion.div
        className={`relative ${selectedSize.container} flex items-center justify-center`}
        whileHover={{ 
          scale: 1.08, 
          rotateY: 15,
          rotateX: -5,
          filter: "brightness(1.15)"
        }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ perspective: 1000 }}
      >
        {/* Glow halo in background */}
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />

        {/* The Vector SVG Emblem */}
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Cyber Metallic Green Gradients */}
            <linearGradient id="greenMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#022c22" />
              <stop offset="40%" stopColor="#059669" />
              <stop offset="70%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
            </linearGradient>

            {/* 3D Extrusion Shadow Gradient */}
            <linearGradient id="extrusionShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* Neon Bloom Filter */}
            <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Circuit Grid Details (Subtle) */}
          <g opacity="0.15">
            <circle cx="100" cy="100" r="95" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="#10b981" strokeWidth="0.5" />
            <line x1="100" y1="5" x2="100" y2="195" stroke="#10b981" strokeWidth="0.5" />
            <line x1="5" y1="100" x2="195" y2="100" stroke="#10b981" strokeWidth="0.5" />
          </g>

          {/* ========================================================= */}
          {/* 3D LOGO SHAPE ELEMENTS (Based on user-uploaded screenshot) */}
          {/* ========================================================= */}

          {/* 1. Underlying 3D Extrusion Base (Dark Forest Green) */}
          <g transform="translate(3, 4)" opacity="0.85">
            {/* Diagonal Slash Plate Base */}
            <polygon 
              points="40,35 15,100 15,145 90,145 40,35" 
              fill="url(#extrusionShadow)" 
            />
            {/* Wing Feather 1 Base */}
            <path d="M 40,40 C 50,15 90,5 135,5 C 150,5 155,10 145,20 C 115,35 80,50 60,60 Z" fill="url(#extrusionShadow)" />
            {/* Wing Feather 2 Base */}
            <path d="M 50,55 C 60,30 100,13 150,13 C 163,13 167,18 155,27 C 120,42 90,55 70,63 Z" fill="url(#extrusionShadow)" />
            {/* Wing Feather 3 Base */}
            <path d="M 60,70 C 70,50 110,34 160,34 C 173,34 177,39 165,48 C 125,61 100,72 80,78 Z" fill="url(#extrusionShadow)" />
            {/* Wing Feather 4 Base */}
            <path d="M 70,85 C 80,69 120,55 170,55 C 183,55 187,60 175,69 C 130,81 110,89 90,93 Z" fill="url(#extrusionShadow)" />
            {/* Wing Feather 5 Base */}
            <path d="M 80,100 C 90,86 130,76 175,76 C 187,76 190,80 180,88 C 140,98 120,104 100,106 Z" fill="url(#extrusionShadow)" />
          </g>

          {/* 2. Main High-Tech Metallic Face */}
          <g>
            {/* Solid Left Backing/Brushed Metal Plate */}
            <polygon 
              points="40,35 15,100 15,145 90,145 40,35" 
              fill="url(#greenMetal)" 
              stroke="#059669"
              strokeWidth="1.5"
            />
            
            {/* Inner carbon fiber / circuit details on plate */}
            <polygon 
              points="38,45 20,100 20,140 82,140 38,45" 
              fill="url(#goldHighlight)" 
              opacity="0.3"
            />

            {/* Glowing Neon Green Outlines */}
            <polyline 
              points="40,35 15,100 15,145 90,145" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2" 
              filter="url(#neonFilter)"
            />

            {/* 5 Distinct curved neon claws/wing feathers (Radiating outward to right) */}
            {/* Feather 1 (Top) */}
            <path 
              d="M 40,40 C 50,15 90,5 135,5 C 150,5 155,10 145,20 C 115,35 80,50 60,60 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 40,40 C 50,15 90,5 135,5" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="2" 
              filter="url(#neonFilter)"
            />

            {/* Feather 2 */}
            <path 
              d="M 50,55 C 60,30 100,13 150,13 C 163,13 167,18 155,27 C 120,42 90,55 70,63 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 50,55 C 60,30 100,13 150,13" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="2" 
              filter="url(#neonFilter)"
            />

            {/* Feather 3 */}
            <path 
              d="M 60,70 C 70,50 110,34 160,34 C 173,34 177,39 165,48 C 125,61 100,72 80,78 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 60,70 C 70,50 110,34 160,34" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="2" 
              filter="url(#neonFilter)"
            />

            {/* Feather 4 */}
            <path 
              d="M 70,85 C 80,69 120,55 170,55 C 183,55 187,60 175,69 C 130,81 110,89 90,93 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 70,85 C 80,69 120,55 170,55" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="2" 
              filter="url(#neonFilter)"
            />

            {/* Feather 5 (Bottom) */}
            <path 
              d="M 80,100 C 90,86 130,76 175,76 C 187,76 190,80 180,88 C 140,98 120,104 100,106 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 80,100 C 90,86 130,76 175,76" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="2" 
              filter="url(#neonFilter)"
            />
          </g>

          {/* ========================================================= */}
          {/* 3D TYPOGRAPHY FOR "NGK" (Futuristic Block Letters)        */}
          {/* ========================================================= */}
          
          {/* 1. Underlying 3D Extrusion Shadow for Text */}
          <g transform="translate(2, 3)" opacity="0.9">
            {/* N */}
            <path d="M 20,150 L 35,150 L 52,175 L 52,150 L 65,150 L 65,190 L 50,190 L 33,165 L 33,190 L 20,190 Z" fill="#022c22" />
            {/* G */}
            <path d="M 75,150 L 120,150 L 120,160 L 92,160 L 92,180 L 120,180 L 120,170 L 105,170 L 105,163 L 120,163 L 120,190 L 75,190 Z" fill="#022c22" />
            {/* K */}
            <path d="M 130,150 L 145,150 L 145,167 L 163,150 L 182,150 L 157,170 L 185,190 L 166,190 L 145,173 L 145,190 L 130,190 Z" fill="#022c22" />
          </g>

          {/* 2. Main Text Face (Metallic Gradient with Neon Outline) */}
          <g>
            {/* Letter N */}
            <path 
              d="M 20,150 L 35,150 L 52,175 L 52,150 L 65,150 L 65,190 L 50,190 L 33,165 L 33,190 L 20,190 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 20,150 L 35,150 L 52,175 L 52,150 L 65,150 L 65,190 L 50,190 L 33,165 L 33,190 L 20,190 Z" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="1" 
              filter="url(#neonFilter)"
            />

            {/* Letter G */}
            <path 
              d="M 75,150 L 120,150 L 120,160 L 92,160 L 92,180 L 120,180 L 120,170 L 105,170 L 105,163 L 120,163 L 120,190 L 75,190 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 75,150 L 120,150 L 120,160 L 92,160 L 92,180 L 120,180 L 120,170 L 105,170 L 105,163 L 120,163 L 120,190 L 75,190 Z" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="1" 
              filter="url(#neonFilter)"
            />

            {/* Letter K */}
            <path 
              d="M 130,150 L 145,150 L 145,167 L 163,150 L 182,150 L 157,170 L 185,190 L 166,190 L 145,173 L 145,190 L 130,190 Z" 
              fill="url(#greenMetal)" 
              stroke="#10b981" 
              strokeWidth="1.5"
            />
            <path 
              d="M 130,150 L 145,150 L 145,167 L 163,150 L 182,150 L 157,170 L 185,190 L 166,190 L 145,173 L 145,190 L 130,190 Z" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="1" 
              filter="url(#neonFilter)"
            />
          </g>

          {/* Core Sparkle Star highlight on top right */}
          <g transform="translate(145, 15)">
            <path d="M 0,-6 L 1,-1 L 6,0 L 1,1 L 0,6 L -1,1 L -6,0 L -1,-1 Z" fill="#ffffff" filter="url(#neonFilter)" />
          </g>
        </svg>
      </motion.div>

      {/* Accompanying clean text tag */}
      {showText && (
        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-white font-black tracking-widest font-mono text-xs">NGK</span>
            <span className="text-emerald-400 font-bold tracking-tight text-[10px] uppercase font-mono">ECOSYSTEM</span>
          </div>
        </div>
      )}
    </div>
  );
}
