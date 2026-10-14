import React from 'react';

interface LoadingScreenProps {
  progress: number; // 0 to 100
  isLoaded: boolean;
}

export function LoadingScreen({ progress, isLoaded }: LoadingScreenProps) {
  if (isLoaded) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ECEEF2] transition-opacity duration-700">
      <div className="w-full max-w-xs px-6 flex flex-col items-center">
        {/* Brand wordmark */}
        <span className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
          SkyElite
        </span>
        <span className="text-xs uppercase tracking-widest text-gray-500 mb-8 font-medium">
          Private Aviation Refined
        </span>

        {/* Minimal Progress Bar */}
        <div className="w-full h-[2px] bg-gray-300 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#202A36] transition-all duration-300 ease-out"
            style={{ width: `${Math.max(8, progress)}%` }}
          />
        </div>

        {/* Status text */}
        <div className="flex justify-between w-full mt-3 text-[11px] font-mono text-gray-500">
          <span>INITIALIZING SCENE</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
