import React, { useMemo } from 'react';

const FallingStars: React.FC = () => {
  const starCount = 15;

  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 3 + 2}s`,
    }));
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      overflow: 'hidden', 
      pointerEvents: 'none', 
      zIndex: 9999 // High number to ensure they are on top
    }}>
      <style>
        {`
          @keyframes shooting-star {
            0% { transform: translateY(0) translateX(0) rotate(-45deg) scale(0); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateY(100vh) translateX(-100vh) rotate(-45deg) scale(1); opacity: 0; }
          }
        `}
      </style>
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            top: '-50px',
            left: star.left,
            width: '2px',
            height: '50px',
            background: 'linear-gradient(to bottom, transparent, white)',
            borderRadius: '9999px',
            filter: 'blur(1px)',
            animation: `shooting-star ${star.duration} linear infinite`,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FallingStars;