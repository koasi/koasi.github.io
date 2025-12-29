
"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

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
  vr: number; // rotational velocity
}

const ASH_BREAK_THRESHOLD = 5; // The amount of "ash" that needs to accumulate before it falls
const ASH_SPAWN_COUNT = 20;    // How many particles to spawn when ash breaks

export const CigaretteTimer: React.FC<CigaretteTimerProps> = ({ timeRemaining, totalDuration, isBurning }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  const smokeParticles = useRef<SmokeParticle[]>([]);
  const fallingAsh = useRef<AshParticle[]>([]);
  const accumulatedAsh = useRef<number>(0);
  const animationFrameId = useRef<number>();

  // Reset animation state when timer is stopped/reset
  useEffect(() => {
    if (!isBurning) {
      smokeParticles.current = [];
      fallingAsh.current = [];
      accumulatedAsh.current = 0;
    }
  }, [isBurning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        return true;
      }
      return false;
    }

    resizeCanvas();
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const draw = () => {
      resizeCanvas();
      ctx.clearRect(0, 0, width, height);

      const isDark = resolvedTheme === 'dark';
      
      // -- Colors --
      const paperColor = isDark ? '#ddd' : '#fff';
      const filterColor = '#f9a602';
      const ashColor = isDark ? '#555' : '#aaa';
      const glowColor = 'rgba(255, 100, 50, 0.8)';
      const smokeColor = isDark ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.4)';
      const ashtrayBody = isDark ? 'hsl(20, 5%, 25%)' : 'hsl(20, 10%, 88%)';
      const ashtrayRim = isDark ? 'hsl(20, 5%, 30%)' : 'hsl(20, 10%, 92%)';
      const ashtrayInterior = isDark ? 'hsl(20, 5%, 20%)' : 'hsl(20, 10%, 80%)';

      // -- Dimensions & Positions --
      const ashtrayY = height * 0.7;
      const ashtrayOuterRadius = width * 0.35;
      const ashtrayInnerRadius = width * 0.25;
      const ashtrayHeight = height * 0.15;
      
      const cigAngle = -Math.PI / 10;
      const totalCigaretteLength = width * 0.55;
      const cigaretteThickness = 8;
      const filterLength = totalCigaretteLength * 0.25;
      
      const progress = Math.max(0, timeRemaining / totalDuration);
      const burnableLength = totalCigaretteLength - filterLength;
      
      const unburntLength = burnableLength * progress;
      const burntLength = burnableLength - unburntLength;

      const pivotX = width * 0.35;
      const pivotY = ashtrayY - ashtrayHeight * 0.2;

      // 1. Draw Ashtray
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2;
      // Main body
      ctx.fillStyle = ashtrayBody;
      ctx.beginPath();
      ctx.ellipse(width / 2, ashtrayY, ashtrayOuterRadius, ashtrayHeight, 0, 0, 2 * Math.PI);
      ctx.fill();
      // Rim highlight
      ctx.fillStyle = ashtrayRim;
      ctx.beginPath();
      ctx.ellipse(width / 2, ashtrayY, ashtrayOuterRadius, ashtrayHeight, 0, Math.PI, 2*Math.PI);
      ctx.fill();
      // Interior
      ctx.fillStyle = ashtrayInterior;
      ctx.beginPath();
      ctx.ellipse(width / 2, ashtrayY, ashtrayInnerRadius, ashtrayHeight * 0.8, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // 2. Draw Cigarette
      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(cigAngle);
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;

      // Paper
      ctx.fillStyle = paperColor;
      ctx.fillRect(filterLength, -cigaretteThickness/2, unburntLength, cigaretteThickness);
      
      // Ash on stick
      if (isBurning && burntLength > 0) {
        const elapsedTime = totalDuration - timeRemaining;
        const lastAshFallTime = Math.floor(elapsedTime / 5) * 5;
        const ashOnStickLength = (elapsedTime - lastAshFallTime) / totalDuration * burnableLength;

        accumulatedAsh.current = (burntLength > ashOnStickLength) ? (burntLength - ashOnStickLength) : 0;
        
        ctx.fillStyle = ashColor;
        ctx.fillRect(filterLength + unburntLength, -cigaretteThickness / 2, ashOnStickLength, cigaretteThickness);
      }
      
      // Filter
      ctx.fillStyle = filterColor;
      ctx.fillRect(0, -cigaretteThickness / 2, filterLength, cigaretteThickness);
      // Filter bands
      ctx.fillStyle = 'rgba(217, 119, 6, 0.5)';
      ctx.fillRect(filterLength - 4, -cigaretteThickness / 2, 1, cigaretteThickness);
      ctx.fillRect(filterLength - 7, -cigaretteThickness / 2, 1, cigaretteThickness);
      
      ctx.restore();

      const tipX = pivotX + Math.cos(cigAngle) * (filterLength + unburntLength);
      const tipY = pivotY + Math.sin(cigAngle) * (filterLength + unburntLength);

      // 3. Handle Ash Falling
      if (isBurning && accumulatedAsh.current > ASH_BREAK_THRESHOLD) {
          for(let i=0; i<ASH_SPAWN_COUNT; i++) {
            fallingAsh.current.push({
              x: tipX + (Math.random() - 0.5) * 5,
              y: tipY + (Math.random() - 0.5) * 5,
              size: Math.random() * 2 + 1,
              vx: (Math.random() - 0.5) * 0.4,
              vy: Math.random() * 0.4 + 0.1,
              opacity: Math.random() * 0.5 + 0.5,
              rotation: Math.random() * Math.PI,
              vr: (Math.random() - 0.5) * 0.1
            });
          }
          accumulatedAsh.current = 0; // Reset
      }

      // Draw and update falling ash
      ctx.fillStyle = ashColor;
      fallingAsh.current = fallingAsh.current.filter(p => {
          if (p.opacity > 0 && p.y < ashtrayY + 5) {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.01; // gravity
              p.rotation += p.vr;
              p.opacity -= 0.008;

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
      

      // 4. Draw Burning Tip & Smoke
      if (isBurning && timeRemaining > 0) {
          const glowRadius = 8;
          const glowGradient = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, glowRadius);
          glowGradient.addColorStop(0, glowColor);
          glowGradient.addColorStop(0.7, 'rgba(255, 120, 50, 0.3)');
          glowGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(tipX, tipY, glowRadius, 0, 2*Math.PI);
          ctx.fill();

          // Spawn new smoke particles
          if (Math.random() > 0.3) {
              smokeParticles.current.push({
                x: tipX,
                y: tipY,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.3 + 0.4,
                vx: Math.random() * 0.2 - 0.1,
                vy: -(Math.random() * 0.6 + 0.2),
              });
          }
      }
      
      // Draw and update smoke particles
      smokeParticles.current = smokeParticles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 1.01; // slow down vertical movement
        p.vx += (Math.random() - 0.5) * 0.05; // gentle turbulence
        p.opacity -= 0.006;
        p.size += 0.04;

        if (p.opacity > 0) {
          ctx.fillStyle = smokeColor;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });
      ctx.globalAlpha = 1.0;

      animationFrameId.current = requestAnimationFrame(draw);
    };

    // Clean up previous animation frame before starting a new one
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
    draw();

    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [timeRemaining, totalDuration, isBurning, resolvedTheme]);

  return (
    <div className="relative w-full h-full max-w-xs max-h-xs aspect-square flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
};

    