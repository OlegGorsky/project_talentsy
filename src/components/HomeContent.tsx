import React, { useState } from 'react';
import { FreudTapper } from './Tapper/FreudTapper';
import { usePoints } from '../hooks/usePoints';
import { RulesModal } from './Modals/RulesModal';

interface HomeContentProps {
  prizes: Array<{
    id: number;
    name: string;
    points: number;
    description: string;
  }>;
  onPrizeSelect: (prize: any) => void;
  onShare: () => void;
  onCopy: () => void;
}

export function HomeContent({ onShare, onCopy }: HomeContentProps) {
  const { points, setPoints } = usePoints();
  const [showRules, setShowRules] = useState(false);

  const handlePointsEarned = (earnedPoints: number) => {
    setPoints(prev => (prev || 0) + earnedPoints);
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* Balance Display */}
      <div className="mt-4 flex items-center justify-center balance-display">
        <div className="bg-white shadow-md border border-gray-100/50 rounded-full px-4 py-2 flex items-center space-x-1.5">
          <img 
            src="https://files.salebot.pro/uploads/file_item/file/535162/image-removebg-preview__67___1__1.png" 
            alt="Coins"
            className="w-6 h-6 object-contain"
            draggable="false"
          />
          <p className="font-manrope text-xl font-bold text-gray-900 no-select">
            {points === null ? '—' : points.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Freud Tapper */}
      <div className="mt-2 md:mt-4 freud-tapper-section">
        <FreudTapper onPointsEarned={handlePointsEarned} />
      </div>

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}