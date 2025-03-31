import React from 'react';

interface TapProgressProps {
  currentTaps: number;
  maxTaps: number;
}

export function TapProgress({ currentTaps, maxTaps }: TapProgressProps) {
  return (
    <div className="w-full max-w-xs mx-auto mt-4 tap-progress">
      <div className="bg-[#865df6]/5 rounded-xl p-3 pb-6">
        <div className="relative">
          {/* Progress bar container */}
          <div className="relative">
            {/* Progress bar background */}
            <div className="h-2 bg-[#865df6]/10 rounded-full">
              {/* Progress bar fill */}
              <div 
                className="absolute left-0 top-0 h-full bg-[#865df6] rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${Math.min((currentTaps / 10) * 100, 100)}%`,
                }}
              />
            </div>
            
            {/* Dots and numbers container */}
            <div className="absolute inset-x-0 top-0 h-2 flex justify-between items-center">
              {Array.from({ length: maxTaps + 1 }).map((_, index) => {
                const position = (index / maxTaps) * 100;
                return (
                  <div 
                    key={index} 
                    className="relative flex flex-col items-center"
                    style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
                  >
                    {/* Dot */}
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 transform ${
                        index <= currentTaps
                          ? 'bg-white scale-100'
                          : 'bg-[#865df6]/20 scale-75'
                      }`}
                    />
                    {/* Number */}
                    <div
                      className={`absolute top-3 text-xs font-medium transition-colors ${
                        index <= currentTaps ? 'text-[#865df6]' : 'text-[#865df6]/40'
                      }`}
                    >
                      {index}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}