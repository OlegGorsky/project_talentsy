import React, { useEffect, useState } from 'react';
import { OnboardingStep } from './OnboardingStep';
import { supabase } from '../../lib/supabase';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    image: 'https://files.salebot.pro/uploads/file_item/file/535162/slide1_result.jpg',
    title: 'Большой розыгрыш\nот Talentsy!',
    description: 'Зарабатывай баллы и участвуй в розыгрыше денежных средств и других ценных призов'
  },
  {
    image: 'https://files.salebot.pro/uploads/file_item/file/535162/slide2_result.jpg',
    title: 'Приглашай друзей',
    description: 'За каждого приглашенного в розыгрыш начисляем 100 баллов'
  },
  {
    image: 'https://files.salebot.pro/uploads/file_item/file/535162/slide3_result.jpg',
    title: 'Выполняй задания',
    description: 'Получай дополнительные баллы за несложные задания прямо в приложении Talentsy'
  }
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    let loadedImages = 0;

    const preloadImages = () => {
      // Preload onboarding images
      const imagesToPreload = STEPS.map(step => step.image);

      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (mounted) {
            loadedImages++;
            if (loadedImages === imagesToPreload.length) {
              setImagesPreloaded(true);
            }
          }
        };
        img.onerror = () => {
          if (mounted) {
            loadedImages++;
            console.warn(`Failed to load image: ${src}`);
            if (loadedImages === imagesToPreload.length) {
              setImagesPreloaded(true);
            }
          }
        };
      });
    };

    preloadImages();

    // Set a timeout to show content even if images fail to load
    const timeoutId = setTimeout(() => {
      if (mounted && !imagesPreloaded) {
        setImagesPreloaded(true);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      const tg = window.Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        try {
          await supabase
            .from('users')
            .update({ onboarding_completed: true })
            .eq('telegram_id', tg.initDataUnsafe.user.id);
        } catch (error) {
          console.error('Error updating onboarding status:', error);
        }
      }
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!imagesPreloaded) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#865df6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <OnboardingStep
      currentStep={currentStep}
      totalSteps={STEPS.length}
      image={STEPS[currentStep].image}
      title={STEPS[currentStep].title}
      description={STEPS[currentStep].description}
      onNext={handleNext}
      onBack={currentStep > 0 ? handleBack : undefined}
    />
  );
}