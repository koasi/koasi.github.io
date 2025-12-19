
"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';

interface IncenseTimerProps {
  timeRemaining: number;
  totalDuration: number;
  isBurning: boolean;
}

interface FallingAsh {
  x: number;
  y: number;
  height: number;
  vy: number;
}

interface PiledAsh {
    x: number;
    y: number;
    height: number;
    width: number;
}

const ASH_BREAK_INTERVAL = 8000; // 8 seconds, to let ash grow longer

export const IncenseTimer: React.FC<IncenseTimerProps> = ({ timeRemaining, totalDuration, isBurning }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  // Animation state
  const smokeParticles = useRef<any[]>([]);
  const fallingAsh = useRef<FallingAsh[]>([]);
  const piledAsh = useRef<PiledAsh[]>([]);
  const lastBreakTime = useRef<number>(0);
  
  const resetAnimation = () => {
      smokeParticles.current = [];
      fallingAsh.current = [];
      piledAsh.current = [];
      lastBreakTime.current = 0;
  };
  
  // Reset animation when timer is reset (stops burning)
  useEffect(() => {
    if (!isBurning) {
        resetAnimation();
    }
  }, [isBurning]);


  // Effect for breaking off ash
  useEffect(() => {
    if (!isBurning) {
        return;
    }
    
    // Initialize lastBreakTime when burning starts
    if (lastBreakTime.current === 0) {
        lastBreakTime.current = Date.now();
    }

    const breakIntervalId = setInterval(() => {
        const dpr = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;
        if(!canvas) return;
        const height = canvas.height / dpr;
        const width = canvas.width / dpr;

        const incenseTotalHeight = height * 0.6;
        const burnRate = incenseTotalHeight / totalDuration;
        
        const currentProgress = 1 - (timeRemaining / totalDuration);
        const totalBurntHeight = incenseTotalHeight * currentProgress;

        const elapsedSinceLastBreak = (Date.now() - lastBreakTime.current) / 1000;
        const burntHeightSinceLastBreak = burnRate * elapsedSinceLastBreak;

        if (burntHeightSinceLastBreak > 1) { // Ensure there's something to break off
            fallingAsh.current.push({
                x: width / 2,
                y: height * 0.2 + totalBurntHeight - burntHeightSinceLastBreak,
                height: burntHeightSinceLastBreak,
                vy: 0.5,
            });
            lastBreakTime.current = Date.now(); // Reset the timer for the next break
        }
    }, ASH_BREAK_INTERVAL);

    return () => {
        clearInterval(breakIntervalId);
    }
  }, [isBurning, timeRemaining, totalDuration]);

  
  // Effect for drawing on canvas
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
      // Recalculate dimensions in case of resize
      rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
      
      ctx.clearRect(0, 0, width, height);
      
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      const progress = Math.max(0, timeRemaining / totalDuration);
      const incenseTotalHeight = height * 0.6;
      const stickX = width / 2;
      const stickWidth = 4;
      
      // Calculate current dimensions based on time
      const unburntHeight = incenseTotalHeight * progress;
      const burntHeight = incenseTotalHeight * (1 - progress);
      const unburntTopY = height * 0.2 + burntHeight;

      const ashColor = isDark ? '#4a5568' : '#a0aec0';

      // 1. Draw Holder
      const holderY = height * 0.8;
      const holderWidth = width * 0.4;
      const holderHeight = height * 0.1;
      
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

      ctx.beginPath();
      ctx.ellipse(width / 2, holderY - holderHeight * 0.15, holderWidth * 0.3, holderHeight * 0.1, 0, Math.PI, 2*Math.PI);
      ctx.strokeStyle = isDark ? 'hsla(210, 10%, 35%, 0.9)' : 'hsla(210, 15%, 98%, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 2. Draw Piled Ash
      let piledHeight = 0;
      piledAsh.current.forEach(ash => piledHeight += ash.height);

      let currentPileY = holderY - holderHeight * 0.2;
      piledAsh.current.forEach(ash => {
          ctx.fillStyle = ashColor;
          ctx.beginPath();
          currentPileY -= ash.height / 2; // Move up by half the height of the current piece
          ctx.ellipse(ash.x, currentPileY, ash.width / 2, ash.height/2, 0, 0, 2*Math.PI);
          ctx.fill();
          currentPileY -= ash.height / 2; // Move up by the other half for the next piece
      });


      // 3. Draw and update falling ash
      fallingAsh.current = fallingAsh.current.filter(ash => {
          const holderTopSurfaceY = (holderY - holderHeight * 0.2) - piledHeight;
          if (ash.y + ash.height < holderTopSurfaceY) {
              ash.y += ash.vy;
              ash.vy += 0.05; // gravity
              ctx.fillStyle = ashColor;
              ctx.fillRect(ash.x - stickWidth / 2, ash.y, stickWidth, ash.height);
              return true;
          } else {
              // Landed
              const pileWidth = stickWidth * 2 + Math.random() * 4;
              piledAsh.current.push({
                  x: ash.x,
                  y: piledHeight, // Use current total height as base y
                  height: ash.height/3, // Becomes squashed on impact
                  width: pileWidth,
              });
              return false; // Remove from falling array
          }
      });
      
      // 4. Draw Incense Stick
      // Unburnt part
      if (progress > 0) {
        ctx.fillStyle = isDark ? '#78350f' : '#9a3412';
        ctx.fillRect(stickX - stickWidth / 2, unburntTopY, stickWidth, unburntHeight);
      }
      
      // Ash part still on stick (grows since last break)
      if(isBurning && timeRemaining < totalDuration) {
          const elapsedSinceBreak = (Date.now() - (lastBreakTime.current || Date.now())) / 1000;
          const burnRate = incenseTotalHeight / totalDuration;
          const ashOnStickHeight = burnRate * elapsedSinceBreak;
          ctx.fillStyle = ashColor;
          ctx.fillRect(stickX - stickWidth / 2, unburntTopY - ashOnStickHeight, stickWidth, ashOnStickHeight);
      }

      // 5. Draw Burning Tip & Smoke
      if (isBurning && timeRemaining > 0) {
        const tipY = unburntTopY; // The top of the unburnt stick

        const glowRadius = 7;
        const glowGradient = ctx.createRadialGradient(stickX, tipY, 0, stickX, tipY, glowRadius);
        glowGradient.addColorStop(0, 'rgba(255, 159, 64, 0.7)');
        glowGradient.addColorStop(0.7, 'rgba(255, 159, 64, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 159, 64, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(stickX - glowRadius, tipY - glowRadius, glowRadius * 2, glowRadius * 2);
        
        ctx.fillStyle = 'rgba(239, 68, 68, 1)';
        ctx.beginPath();
        ctx.arc(stickX, tipY, stickWidth / 2 + 1, 0, 2 * Math.PI);
        ctx.fill();

        if (Math.random() > 0.5) {
            smokeParticles.current.push({
              x: stickX,
              y: tipY, // Smoke originates from the burning tip
              size: Math.random() * 2 + 1,
              opacity: 0.8,
              vx: Math.random() * 0.4 - 0.2,
              vy: -(Math.random() * 0.5 + 0.3),
            });
        }
      }
      
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
