import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

interface Prize {
  id: number;
  name: string;
  points: number;
  description: string;
  botUrl: string;
  imageUrl: string;
}

interface ShopTabProps {
  prizes: Prize[];
  onPrizeSelect: (prize: Prize) => void;
}

export function ShopTab({ prizes, onPrizeSelect }: ShopTabProps) {
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Preload all images
    prizes.forEach(prize => {
      const img = new Image();
      img.src = prize.imageUrl;
      img.onload = () => {
        setImagesLoaded(prev => ({
          ...prev,
          [prize.id]: true
        }));
      };
      img.onerror = () => {
        console.error(`Failed to load image for prize ${prize.id}`);
        setImagesLoaded(prev => ({
          ...prev,
          [prize.id]: true // Still mark as loaded to remove skeleton
        }));
      };
    });
  }, [prizes]);

  return (
    <div className="p-4">
      <div className="bg-[#865df6] text-white p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-3">
          <ShoppingBag size={24} />
          <div>
            <h2 className="text-lg font-semibold">Магазин</h2>
            <p className="text-sm opacity-90">Обменивайте баллы на практикумы</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {prizes.map((prize) => (
          <div
            key={prize.id}
            className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onPrizeSelect(prize)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 flex-shrink-0">
                {!imagesLoaded[prize.id] ? (
                  <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <img
                    src={prize.imageUrl}
                    alt={prize.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{prize.name}</h3>
                <div className="inline-flex items-center px-3 py-1 bg-[#865df6] bg-opacity-10 rounded-full">
                  <span className="text-sm font-medium text-[#865df6]">{prize.points} баллов</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}