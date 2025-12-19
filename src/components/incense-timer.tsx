"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';

interface IncenseTimerProps {
  timeRemaining: number;
  totalDuration: number;
  isBurning: boolean;
}

interface SmokeParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
}

export const IncenseTimer: React.FC<IncenseTimerProps> = ({ timeRemaining, totalDuration, isBurning }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const smokeParticles = useRef<SmokeParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = Math.max(0, timeRemaining / totalDuration);
      const incenseTotalHeight = height * 0.6;
      const incenseBurntHeight = incenseTotalHeight * (1 - progress);
      const incenseUnburntHeight = incenseTotalHeight * progress;
      const incenseTopY = height * 0.2 + incenseBurntHeight;

      // 1. Draw Holder
      const holderY = height * 0.8;
      const holderWidth = width * 0.4;
      const holderHeight = height * 0.1;
      
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      // Glass effect
      const glassGradient = ctx.createLinearGradient(0, holderY - holderHeight, 0, holderY);
      if (isDark) {
        glassGradient.addColorStop(0, 'hsla(210, 10%, 25%, 0.5)');
        glassGradient.addColorStop(0.5, 'hsla(210, 10%, 25%, 0.2)');
        glassGradient.addColorStop(1, 'hsla(210, 10%, 25%, 0.4)');
      } else {
        glassGradient.addColorStop(0, 'hsla(210, 15%, 95%, 0.5)');
        glassGradient.addColorStop(0.5, 'hsla(210, 15%, 95%, 0.2)');
        glassGradient.addColorStop(1, 'hsla(210, 15%, 95%, 0.4)');
      }
      ctx.fillStyle = glassGradient;
      ctx.strokeStyle = isDark ? 'hsl(210, 10%, 40%)' : 'hsl(210, 15%, 85%)';
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      ctx.ellipse(width / 2, holderY, holderWidth / 2, holderHeight / 2, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Reflection on holder
      ctx.beginPath();
      ctx.ellipse(width / 2, holderY - holderHeight * 0.15, holderWidth * 0.3, holderHeight * 0.1, 0, Math.PI, 2*Math.PI);
      ctx.strokeStyle = isDark ? 'hsla(210, 10%, 35%, 0.9)' : 'hsla(210, 15%, 98%, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();


      // 2. Draw Incense Stick
      const stickX = width / 2;
      const stickWidth = 4;
      
      // Ash part
      if (progress < 1) {
        ctx.fillStyle = isDark ? '#4a5568' : '#a0aec0'; // gray-600 dark:gray-500
        ctx.fillRect(stickX - stickWidth / 2, height * 0.2, stickWidth, incenseBurntHeight);
      }

      // Unburnt part
      ctx.fillStyle = isDark ? '#78350f' : '#9a3412'; // amber-900 dark:amber-800
      ctx.fillRect(stickX - stickWidth / 2, incenseTopY, stickWidth, incenseUnburntHeight);
      
      // 3. Draw Burning Tip & Smoke
      if (isBurning && timeRemaining > 0) {
        // Glow
        const glowRadius = 7;
        const glowGradient = ctx.createRadialGradient(stickX, incenseTopY, 0, stickX, incenseTopY, glowRadius);
        glowGradient.addColorStop(0, 'rgba(255, 159, 64, 0.7)');
        glowGradient.addColorStop(0.7, 'rgba(255, 159, 64, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 159, 64, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(stickX - glowRadius, incenseTopY - glowRadius, glowRadius * 2, glowRadius * 2);
        
        // Tip
        ctx.fillStyle = 'rgba(239, 68, 68, 1)'; // red-500
        ctx.beginPath();
        ctx.arc(stickX, incenseTopY, stickWidth / 2 + 1, 0, 2 * Math.PI);
        ctx.fill();

        // Generate new smoke particle
        smokeParticles.current.push({
          x: stickX,
          y: incenseTopY,
          size: Math.random() * 2 + 1,
          opacity: 0.8,
          vx: Math.random() * 0.4 - 0.2,
          vy: -(Math.random() * 0.5 + 0.3),
        });
      }
      
      // Update and draw smoke particles
      ctx.fillStyle = isDark ? 'rgba(100, 116, 139, 0.5)' : 'rgba(148, 163, 184, 0.5)';
      smokeParticles.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.008;
        p.size += 0.02;

        if (p.opacity <= 0) {
          smokeParticles.current.splice(index, 1);
        } else {
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [timeRemaining, totalDuration, isBurning, theme]);

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
};
