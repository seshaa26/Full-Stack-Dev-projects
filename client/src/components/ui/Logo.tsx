import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', animate = true }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${dimensions} ${className}`}>
      {/* Background Pulse Glow */}
      {animate && (
        <div className="absolute inset-0 bg-primary-500 rounded-full blur-2xl opacity-20 animate-pulse-glow"></div>
      )}
      
      {/* 3D SVG Logo */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* D Outer Gradient */}
          <linearGradient id="gradD" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" /> {/* Sky 400 */}
            <stop offset="50%" stopColor="#2563eb" /> {/* Blue 600 */}
            <stop offset="100%" stopColor="#1e3a8a" /> {/* Blue 900 */}
          </linearGradient>

          {/* D Bevel Highlight */}
          <linearGradient id="bevelD" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* X Left Leg Gradient */}
          <linearGradient id="gradX1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" /> {/* Indigo 400 */}
            <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo 600 */}
          </linearGradient>

          {/* X Right Leg Gradient */}
          <linearGradient id="gradX2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" /> {/* Purple 500 */}
            <stop offset="100%" stopColor="#7e22ce" /> {/* Purple 700 */}
          </linearGradient>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
          </filter>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#38bdf8" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* The 'D' Shape */}
        <g filter="url(#shadow)">
          {/* Main D Body */}
          <path 
            d="M 12.5 20 L 42.5 20 C 67.5 20, 77.5 40, 77.5 60 C 77.5 80, 67.5 100, 42.5 100 L 12.5 100 Z M 32.5 40 L 32.5 80 C 47.5 80, 52.5 70, 52.5 60 C 52.5 50, 47.5 40, 32.5 40 Z" 
            fill="url(#gradD)" 
            fillRule="evenodd"
          />
          {/* D Bevel Highlight (Fake 3D Rim Light) */}
          <path 
            d="M 12.5 20 L 42.5 20 C 67.5 20, 77.5 40, 77.5 60 C 77.5 80, 67.5 100, 42.5 100 L 12.5 100 Z M 32.5 40 L 32.5 80 C 47.5 80, 52.5 70, 52.5 60 C 52.5 50, 47.5 40, 32.5 40 Z" 
            fill="none" 
            stroke="url(#bevelD)"
            strokeWidth="1.5"
            transform="translate(0, -1.5)"
          />
        </g>

        {/* The 'X' Left Leg (Behind Right Leg) */}
        <g filter="url(#shadow)">
          <path 
            d="M 52.5 20 L 67.5 20 L 107.5 100 L 92.5 100 Z" 
            fill="url(#gradX1)" 
          />
          {/* Bevel Highlight */}
          <path 
            d="M 52.5 20 L 67.5 20 L 107.5 100 L 92.5 100 Z" 
            fill="none" 
            stroke="#c7d2fe"
            strokeWidth="1"
            strokeOpacity="0.6"
            transform="translate(-1, -1)"
          />
        </g>

        {/* The 'X' Right Leg (In Front) */}
        <g filter="url(#shadow)">
          <path 
            d="M 107.5 20 L 92.5 20 L 52.5 100 L 67.5 100 Z" 
            fill="url(#gradX2)" 
          />
          {/* Bevel Highlight */}
          <path 
            d="M 107.5 20 L 92.5 20 L 52.5 100 L 67.5 100 Z" 
            fill="none" 
            stroke="#e9d5ff"
            strokeWidth="1"
            strokeOpacity="0.6"
            transform="translate(1, -1)"
          />
        </g>

        {/* Abstract Glowing Core in the Intersection */}
        <circle cx="80" cy="60" r="4" fill="#ffffff" filter="url(#glow)" />
      </svg>
    </div>
  );
};

export default Logo;
