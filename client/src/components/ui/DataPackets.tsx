import React, { useEffect, useState } from 'react';

const DataPackets: React.FC = () => {
  const [packets, setPackets] = useState<number[]>([]);

  useEffect(() => {
    // Generate 12 data packets that will stagger their animations
    setPackets(Array.from({ length: 12 }).map((_, i) => i));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {packets.map((i) => {
        // Randomize positions, delays, and speeds
        const top = Math.random() * 100 - 20; // Allow starting slightly off-screen top
        const left = Math.random() * 100 - 20; // Allow starting slightly off-screen left
        const delay = Math.random() * 15; // Stagger up to 15 seconds
        const duration = 2.5 + Math.random() * 2; // Lasts 2.5 to 4.5 seconds

        return (
          <div
            key={i}
            className="absolute h-[1px] w-32 bg-gradient-to-r from-transparent via-primary-400 to-primary-600 opacity-0 animate-data-packet drop-shadow-neon"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transformOrigin: 'left',
            }}
          />
        );
      })}
    </div>
  );
};

export default DataPackets;
