import React, { useEffect, useRef } from 'react';

export interface GravityStarsBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  starsCount?: number;
  starsSize?: number;
  starsOpacity?: number;
  glowIntensity?: number;
  glowAnimation?: 'instant' | 'ease' | 'spring';
  movementSpeed?: number;
  mouseInfluence?: number;
  mouseGravity?: 'attract' | 'repel';
  gravityStrength?: number;
  starsInteraction?: boolean;
  starsInteractionType?: 'bounce' | 'merge';
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

const STAR_COLORS = [
  '#ffffff',
  '#00f2fe', // Neon Cyan
  '#4facfe', // Electric Blue
  '#c084fc', // Neon Violet
  '#e2e8f0', // Cool White
];

export const GravityStarsBackground: React.FC<GravityStarsBackgroundProps> = ({
  className = '',
  children,
  starsCount = 85,
  starsSize = 2,
  starsOpacity = 0.8,
  glowIntensity = 15,
  movementSpeed = 0.4,
  mouseInfluence = 140,
  mouseGravity = 'attract',
  gravityStrength = 60,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Khởi tạo các vì sao
      stars = Array.from({ length: starsCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * movementSpeed * 0.8,
        vy: (Math.random() - 0.5) * movementSpeed * 0.8,
        size: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      }));
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Bắt sự kiện chuột
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Lực hấp dẫn của chuột (Gravity Physics)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseInfluence && dist > 1) {
            const normalizedForce = (1 - dist / mouseInfluence) * (gravityStrength / 1000);
            const dir = mouseGravity === 'attract' ? 1 : -1;
            star.vx += dx * normalizedForce * dir * 0.08;
            star.vy += dy * normalizedForce * dir * 0.08;
          }
        }

        // Chuyển động nhẹ nhàng và ma sát không gian
        star.vx *= 0.97;
        star.vy *= 0.97;

        // Vận tốc trôi nền cơ bản
        star.x += star.vx + (Math.sin(time * 0.01 + star.twinklePhase) * 0.15 * movementSpeed);
        star.y += star.vy + (Math.cos(time * 0.01 + star.twinklePhase) * 0.15 * movementSpeed);

        // Bọc quanh viền màn hình (Edge wrapping)
        if (star.x < -10) star.x = width + 10;
        else if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        else if (star.y > height + 10) star.y = -10;

        // Hiệu ứng lấp lánh (Twinkle)
        const alpha = Math.max(
          0.1,
          Math.min(
            1,
            (star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3) * starsOpacity
          )
        );

        // Vẽ vì sao với Glow Shader
        ctx.save();
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = star.color;
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * starsSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [
    starsCount,
    starsSize,
    starsOpacity,
    glowIntensity,
    movementSpeed,
    mouseInfluence,
    mouseGravity,
    gravityStrength,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {children && (
        <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto', width: '100%', height: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
};
