import React, { useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SpiderWebProps {
  className?: string;
  particleCount?: number;
  lineDistance?: number;
  color?: string;
}

const SpiderWeb: React.FC<SpiderWebProps> = ({
  className = '',
  particleCount = 60,
  lineDistance = 120,
  color = '10, 102, 194', // LinkedIn blue RGB
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let points: Point[] = [];

    const resize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const initPoints = () => {
      points = [];
      for (let i = 0; i < particleCount; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      // Add mouse as a virtual point for interactivity
      const allPoints = [...points];
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        allPoints.push({ x: mx, y: my, vx: 0, vy: 0 });
      }

      // Draw connections
      for (let i = 0; i < allPoints.length; i++) {
        for (let j = i + 1; j < allPoints.length; j++) {
          const dx = allPoints[i].x - allPoints[j].x;
          const dy = allPoints[i].y - allPoints[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < lineDistance) {
            const opacity = (1 - dist / lineDistance) * 0.25;
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(allPoints[i].x, allPoints[i].y);
            ctx.lineTo(allPoints[j].x, allPoints[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of points) {
        ctx.fillStyle = `rgba(${color}, 0.3)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resize();
    initPoints();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initPoints();
    });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount, lineDistance, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'auto' }}
    />
  );
};

export default SpiderWeb;
