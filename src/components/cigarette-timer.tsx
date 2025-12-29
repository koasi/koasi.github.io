
"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';

interface CigaretteTimerProps {
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

interface AshParticle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  rotation: number;
  vr: number;
}

const ASH_BREAK_INTERVAL = 5000; // 5 seconds for ash to fall

export const CigaretteTimer: React.FC<CigaretteTimerProps> = ({ timeRemaining, totalDuration, isBurning }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  const smokeParticles = useRef<SmokeParticle[]>([]);
  const fallingAsh = useRef<AshParticle[]>([]);
  const lastBreakTime = useRef<number>(0);
  const accumulatedAshHeight = useRef<number>(0);

  const resetAnimation = () => {
    smokeParticles.current = [];
    fallingAsh.current = [];
    lastBreakTime.current = 0;
    accumulatedAshHeight.current = 0;
  };

  useEffect(() => {
    if (!isBurning) {
      resetAnimation();
    }
  }, [isBurning]);

  useEffect(() => {
    if (!isBurning) return;

    if (lastBreakTime.current === 0) {
      lastBreakTime.current = Date.now();
    }

    const breakIntervalId = setInterval(() => {
      const dpr = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = canvas.width / dpr;
      
      const totalCigaretteLength = width * 0.5;
      const burnRate = totalCigaretteLength / totalDuration;
      const elapsedSinceLastBreak = (Date.now() - lastBreakTime.current) / 1000;
      const ashToBreakOff = burnRate * elapsedSinceLastBreak;

      if (ashToBreakOff > 1) {
        accumulatedAshHeight.current += ashToBreakOff;
        lastBreakTime.current = Date.now();
      }
    }, ASH_BREAK_INTERVAL);

    return () => clearInterval(breakIntervalId);
  }, [isBurning, totalDuration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    let animationFrameId: number;

    const draw = () => {
      rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      // -- Colors --
      const ashColor = isDark ? '#555' : '#aaa';
      const piledAshColor = isDark ? '#444' : '#999';
      const ashtrayColor = isDark ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 85%)';
      const ashtrayHighlight = isDark ? 'hsl(0, 0%, 25%)' : 'hsl(0, 0%, 100%)';

      // -- Dimensions & Positions --
      const ashtrayY = height * 0.75;
      const ashtrayRadius = width * 0.3;
      const ashtrayHeight = height * 0.2;
      
      const cigAngle = -Math.PI / 8;
      const totalCigaretteLength = width * 0.6;
      const cigaretteThickness = 8;
      const filterLength = totalCigaretteLength * 0.2;
      
      const progress = Math.max(0, timeRemaining / totalDuration);
      const burnableLength = totalCigaretteLength - filterLength;
      
      const unburntLength = burnableLength * progress;
      const burntLength = burnableLength - unburntLength;

      const pivotX = width * 0.3;
      const pivotY = ashtrayY - cigaretteThickness / 2;

      // 1. Draw Ashtray
      ctx.fillStyle = ashtrayColor;
      ctx.strokeStyle = isDark ? '#333' : '#ccc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(width / 2, ashtrayY, ashtrayRadius, ashtrayHeight / 2, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = ashtrayHighlight;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(width / 2, ashtrayY - 2, ashtrayRadius - 5, ashtrayHeight / 2 - 2, 0, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1.0;


      // 2. Draw Piled Ash & Falling Ash
      if(accumulatedAshHeight.current > 0) {
        for(let i=0; i<20; i++) { // spawn a few particles at a time
          fallingAsh.current.push({
            x: pivotX + Math.cos(cigAngle) * (totalCigaretteLength - burntLength) - 5,
            y: pivotY + Math.sin(cigAngle) * (totalCigaretteLength - burntLength),
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.5 + 0.2,
            opacity: 1,
            rotation: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.1
          });
        }
        accumulatedAshHeight.current = Math.max(0, accumulatedAshHeight.current - 1);
      }

      ctx.fillStyle = piledAshColor;
      fallingAsh.current = fallingAsh.current.filter(p => {
          if (p.opacity > 0 && p.y < ashtrayY - 5) {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.01; // gravity
              p.rotation += p.vr;
              p.opacity -= 0.01;

              ctx.save();
              ctx.globalAlpha = p.opacity;
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
              ctx.restore();
              return true;
          }
          return false;
      });
      

      // 3. Draw Cigarette
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(cigAngle);

      // Filter
      ctx.fillStyle = '#f9a602';
      ctx.fillRect(0, -cigaretteThickness / 2, filterLength, cigaretteThickness);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, -cigaretteThickness / 2, filterLength, cigaretteThickness);

      // Paper
      ctx.fillStyle = isDark ? '#ccc' : '#fff';
      ctx.fillRect(filterLength, -cigaretteThickness/2, unburntLength, cigaretteThickness);
      
      // Burnt part
      if (isBurning) {
        ctx.fillStyle = ashColor;
        ctx.fillRect(filterLength + unburntLength, -cigaretteThickness / 2, burntLength, cigaretteThickness);
      }

      ctx.restore();


      // 4. Draw Burning Tip & Smoke
      if (isBurning && timeRemaining > 0) {
          const tipX = pivotX + Math.cos(cigAngle) * (filterLength + unburntLength);
          const tipY = pivotY + Math.sin(cigAngle) * (filterLength + unburntLength);

          const glowRadius = 8;
          const glowGradient = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, glowRadius);
          glowGradient.addColorStop(0, 'rgba(255, 100, 50, 0.8)');
          glowGradient.addColorStop(0.7, 'rgba(255, 120, 50, 0.3)');
          glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
          ctx.fillStyle = glowGradient;
          ctx.fillRect(tipX - glowRadius, tipY - glowRadius, glowRadius * 2, glowRadius * 2);

          ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
          ctx.beginPath();
          ctx.arc(tipX, tipY, cigaretteThickness / 4, 0, 2 * Math.PI);
          ctx.fill();

          if (Math.random() > 0.4) {
              smokeParticles.current.push({
                x: tipX,
                y: tipY,
                size: Math.random() * 2 + 1.5,
                opacity: 0.7,
                vx: Math.random() * 0.3 - 0.15,
                vy: -(Math.random() * 0.6 + 0.4),
              });
          }
      }
      
      ctx.fillStyle = isDark ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.4)';
      smokeParticles.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.007;
        p.size += 0.03;

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
