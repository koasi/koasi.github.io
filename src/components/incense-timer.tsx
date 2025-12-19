"use client";

import React from 'react';

interface IncenseTimerProps {
  timeRemaining: number;
  totalDuration: number;
  isBurning: boolean;
}

export const IncenseTimer: React.FC<IncenseTimerProps> = ({ timeRemaining, totalDuration, isBurning }) => {
  const progress = Math.max(0, timeRemaining / totalDuration);
  const incenseHeight = 200 * progress;
  const incenseY = 250 - incenseHeight;

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 300 300">
        {/* Incense Holder */}
        <path
          d="M 100 270 Q 150 290 200 270 L 180 260 Q 150 275 120 260 Z"
          className="fill-yellow-800 dark:fill-yellow-900"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Incense Stick (remaining) */}
        <rect
          x="147"
          y={incenseY}
          width="6"
          height={incenseHeight}
          className="fill-amber-700 dark:fill-amber-800"
          rx="3"
        />

        {/* Burning Tip */}
        {isBurning && timeRemaining > 0 && (
          <>
            <circle cx="150" cy={incenseY} r="5" className="fill-red-500" />
            <circle cx="150" cy={incenseY} r="8" className="fill-orange-400/50" filter="url(#glow)" />
          </>
        )}
        
        {/* Smoke */}
        {isBurning && timeRemaining > 0 && (
          <g>
            <path 
              d="M150,
              {incenseY-5} Q155,
              {incenseY-15} 150,
              {incenseY-25} T150,
              {incenseY-45}"
              className="fill-none stroke-gray-400 dark:stroke-gray-600 stroke-1 opacity-60 animate-smoke"
              strokeLinecap="round"
              style={{ animationDelay: '0s' }}
            />
            <path 
              d="M150,
              {incenseY-5} Q145,
              {incenseY-20} 150,
              {incenseY-35} T150,
              {incenseY-50}"
              className="fill-none stroke-gray-400 dark:stroke-gray-600 stroke-1 opacity-50 animate-smoke"
              strokeLinecap="round"
              style={{ animationDelay: '1.5s' }}
            />
          </g>
        )}

        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};
