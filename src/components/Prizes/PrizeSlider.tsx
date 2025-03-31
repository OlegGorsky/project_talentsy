import React, { useRef, useState, useEffect } from 'react';

interface Prize {
  id: number;
  name: string;
  points: number;
  description: string;
  imageUrl: string;
}

interface PrizeSliderProps {
  prizes: Prize[];
  onPrizeSelect: (prize: Prize) => void;
}

export function PrizeSlider({ prizes, onPrizeSelect }: PrizeSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Preload images as soon as component mounts
  useEffect(() => {
    const imagePromises = prizes.map(prize => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = prize.imageUrl;
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => {
        console.error('Failed to load some prize images');
        setImagesLoaded(true); // Still set to true to remove loading state
      });

    // Set a timeout to show content even if images fail to load
    const timeoutId = setTimeout(() => {
      setImagesLoaded(true);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [prizes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handlePrizeClick = (prize: Prize) => {
    if (!isDragging) {
      onPrizeSelect(prize);
    }
  };

  return (
    <div
      ref={sliderRef}
      className="flex overflow-x-auto px-4 pb-4 space-x-2 scrollbar-hide select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {prizes.map((prize) => (
        <div
          key={prize.id}
          className="flex-none w-32"
          onClick={() => handlePrizeClick(prize)}
        >
          <div className="border-2 border-[#865df6] rounded-lg overflow-hidden bg-gray-50">
            {!imagesLoaded ? (
              <div className="w-full aspect-square animate-pulse bg-gray-200" />
            ) : (
              <img
                src={prize.imageUrl}
                alt={prize.name}
                className="w-full aspect-square object-contain"
                draggable="false"
                loading="eager"
                decoding="async"
              />
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-center text-[#865df6]">
            {prize.name}
          </p>
        </div>
      ))}
    </div>
  );
}