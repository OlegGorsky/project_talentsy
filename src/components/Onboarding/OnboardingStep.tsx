import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface OnboardingStepProps {
  currentStep: number;
  totalSteps: number;
  image: string;
  title: string;
  description: string;
  onNext: () => void;
  onBack?: () => void;
}

export function OnboardingStep({
  currentStep,
  totalSteps,
  image,
  title,
  description,
  onNext,
  onBack
}: OnboardingStepProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset states when image changes
    setImageLoaded(false);
    setIsVisible(false);

    // Preload the image
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setImageLoaded(true);
      // Add a small delay before showing the image for smooth transition
      setTimeout(() => setIsVisible(true), 50);
    };
  }, [image]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-48 h-48 mb-8 relative">
          {/* Loading skeleton */}
          <div 
            className={`absolute inset-0 bg-gray-100 rounded-lg transition-opacity duration-300 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          
          {/* Image */}
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-3 whitespace-pre-line">{title}</h2>
        <p className="text-gray-600 mb-4 max-w-sm">{description}</p>
        
        {/* Step Dots */}
        <div className="flex space-x-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-6 bg-[#865df6]'
                  : index < currentStep
                  ? 'w-1.5 bg-[#865df6]'
                  : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <button
          onClick={onNext}
          className="w-full bg-[#865df6] text-white py-3 rounded-lg font-medium hover:bg-[#7147f5] transition-colors"
          disabled={!imageLoaded}
        >
          {currentStep === totalSteps - 1 ? 'Начать' : 'Далее'}
        </button>
      </div>
    </div>
  );
}