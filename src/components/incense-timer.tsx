"use client";

import React from 'react';

interface IncenseTimerProps {
  timeRemaining: number;
  totalDuration: number;
  isBurning: boolean;
}

export const IncenseTimer: React.FC<IncenseTimerProps> = ({ timeRemaining, totalDuration, isBurning }) => {
  const progress = Math.max(0, timeRemaining / totalDuration);
  const incenseHeight = 180 * progress;
  const incenseY = 240 - incenseHeight;

  // Use a non-linear transform for a more natural smoke path
  const smokePath = `M150,${incenseY-5} Q155,${incenseY-20} 150,${incenseY-35} T150,${incenseY-55}`;
  const smokePath2 = `M150,${incenseY-5} Q145,${incenseY-25} 150,${incenseY-45} T150,${incenseY-65}`;


  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(210 15% 95% / 0.5)' }} />
            <stop offset="50%" style={{ stopColor: 'hsl(210 15% 95% / 0.2)' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(210 15% 95% / 0.4)' }} />
          </linearGradient>
           <linearGradient id="glassGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(210 10% 25% / 0.5)' }} />
            <stop offset="50%" style={{ stopColor: 'hsl(210 10% 25% / 0.2)' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(210 10% 25% / 0.4)' }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Incense Holder - Glass effect */}
        <path 
            d="M 100 260 C 100 280, 200 280, 200 260 C 200 240, 100 240, 100 260"
            className="fill-[url(#glassGradient)] dark:fill-[url(#glassGradientDark)] stroke-gray-300 dark:stroke-gray-600"
            strokeWidth="0.5"
        />
        {/* Reflection on holder */}
        <path
            d="M 120 252 C 140 248, 160 248, 180 252"
            fill="none"
            stroke="hsl(210 15% 95% / 0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
         <path
            d="M 120 252 C 140 248, 160 248, 180 252"
            fill="none"
            stroke="hsl(210 10% 25% / 0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="dark:stroke-hsl(210 10% 25% / 0.8)"
        />

        {/* Incense Stick (ash part) */}
        { progress < 1 && (
             <rect
                x="148"
                y={incenseY}
                width="4"
                height={180 * (1-progress)}
                className="fill-gray-300 dark:fill-gray-600"
                rx="2"
            />
        )}

        {/* Incense Stick (unburnt) */}
        <rect
          x="148"
          y={incenseY}
          width="4"
          height={incenseHeight}
          className="fill-amber-800 dark:fill-amber-900"
          rx="2"
        />
        
        {/* Burning Tip */}
        {isBurning && timeRemaining > 0 && (
          <>
            <circle cx="150" cy={incenseY} r="4" className="fill-red-500" />
            <circle cx="150" cy={incenseY} r="7" className="fill-orange-400/50" filter="url(#glow)" />
          </>
        )}
        
        {/* Smoke */}
        {isBurning && timeRemaining > 0 && (
          <g>
            <path 
              d={smokePath}
              className="fill-none stroke-gray-400 dark:stroke-gray-500/80 stroke-1 opacity-60 animate-smoke"
              strokeLinecap="round"
              style={{ animationDelay: '0s' }}
            />
            <path 
              d={smokePath2}
              className="fill-none stroke-gray-400 dark:stroke-gray-500/80 stroke-1 opacity-50 animate-smoke"
              strokeLinecap="round"
              style={{ animationDelay: '1.5s' }}
            />
          </g>
        )}
      </svg>
    </div>
  );
};
