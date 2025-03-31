import React, { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { QUOTES } from './FreudQuotes';
import { TapProgress } from './TapProgress';
import { FreudTitle } from './FreudTitle';

// Image size configuration in pixels
const IMAGE_CONFIG = {
  width: 260, // Pixel width
  height: 260, // Pixel height
  imageUrl: 'https://files.salebot.pro/uploads/file_item/file/535162/8c83f27e1029995b4d5f21487898cffd-fotor-bg-remover-2025032712659.png'
};

interface FreudTapperProps {
  onPointsEarned: (points: number) => void;
}

export function FreudTapper({ onPointsEarned }: FreudTapperProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [showPoints, setShowPoints] = useState(false);
  const [pointsPosition, setPointsPosition] = useState({ x: 0, y: 0 });
  const [reachedDailyLimit, setReachedDailyLimit] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const lastTapTime = useRef(0);
  const usedQuotes = useRef<Set<string>>(new Set());
  const tapAreaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Preload Freud image
    const img = new Image();
    img.src = IMAGE_CONFIG.imageUrl;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      console.error('Failed to load Freud image');
      setImageLoaded(true); // Still show image container on error
    };

    // Set a timeout to show content even if image fails to load
    const timeoutId = setTimeout(() => {
      setImageLoaded(true);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const getRandomQuote = () => {
      let availableQuotes = QUOTES.filter(quote => !usedQuotes.current.has(quote));
      if (availableQuotes.length === 0) {
        usedQuotes.current.clear();
        availableQuotes = QUOTES;
      }
      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      const quote = availableQuotes[randomIndex];
      usedQuotes.current.add(quote);
      return quote;
    };

    setCurrentQuote(getRandomQuote());
  }, []);

  const checkDailyLimit = useCallback(async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user?.id) return;

    try {
      const { data } = await supabase
        .from('daily_taps')
        .select('tap_count')
        .eq('user_id', tg.initDataUnsafe.user.id)
        .eq('tap_date', new Date().toISOString().split('T')[0])
        .single();

      if (data) {
        setTapCount(data.tap_count);
        if (data.tap_count >= 10) {
          setReachedDailyLimit(true);
          setCurrentQuote("Всё! Сегодня натапались. Ничего умнее я уже не придумаю. Приходи завтра.");
        }
      }
    } catch (error) {
      console.error('Error checking daily limit:', error);
    }
  }, []);

  useEffect(() => {
    checkDailyLimit();
  }, [checkDailyLimit]);

  const handleTap = useCallback(async (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) return;
    lastTapTime.current = now;

    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user?.id || reachedDailyLimit) return;

    let x = 0, y = 0;
    if (tapAreaRef.current) {
      const rect = tapAreaRef.current.getBoundingClientRect();
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      setPointsPosition({ x, y: y - 30 });
    }

    setShowPoints(true);
    setTimeout(() => setShowPoints(false), 1500);

    let availableQuotes = QUOTES.filter(quote => !usedQuotes.current.has(quote));
    if (availableQuotes.length === 0) {
      usedQuotes.current.clear();
      availableQuotes = QUOTES;
    }
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    const newQuote = availableQuotes[randomIndex];
    usedQuotes.current.add(newQuote);
    setCurrentQuote(newQuote);

    onPointsEarned(2);

    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }

    try {
      const { data: canTap, error: tapError } = await supabase
        .rpc('increment_daily_taps', {
          user_id_param: tg.initDataUnsafe.user.id
        });

      if (tapError) throw tapError;

      if (!canTap) {
        setReachedDailyLimit(true);
        setCurrentQuote("Всё! Сегодня натапались. Ничего умнее я уже не придумаю. Приходи завтра.");
        return;
      }

      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);
      
      if (newTapCount >= 10) {
        setReachedDailyLimit(true);
        setCurrentQuote("Всё! Сегодня натапались. Ничего умнее я уже не придумаю. Приходи завтра.");
      }

      await supabase.rpc('add_points_safely', {
        user_id_param: tg.initDataUnsafe.user.id,
        points_to_add: 2
      });
    } catch (error) {
      console.error('Error handling tap:', error);
    }
  }, [onPointsEarned, reachedDailyLimit, tapCount]);

  const handlePressStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsPressed(true);
    handleTap(e);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-full mb-4 h-24 flex items-center justify-center px-4">
        {currentQuote && (
          <div 
            className={`${reachedDailyLimit ? 'bg-red-500' : 'bg-[#865df6]'} text-white p-4 rounded-xl max-w-sm animate-fade-in shadow-lg relative mx-auto`}
          >
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent ${reachedDailyLimit ? 'border-t-red-500' : 'border-t-[#865df6]'}`} />
            <p className="text-sm italic leading-relaxed text-center font-medium">{currentQuote}</p>
          </div>
        )}
      </div>

      <div className="relative">
        <div 
          className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-150 ease-in-out ${
            isPressed ? 'opacity-40 scale-90' : 'scale-100'
          } ${reachedDailyLimit ? 'bg-red-500' : 'bg-[#865df6]'}`}
        />
        
        <button
          ref={tapAreaRef}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`relative transition-all duration-150 ease-in-out transform ${
            isPressed 
              ? 'scale-95 brightness-110' 
              : 'scale-100 hover:scale-102 hover:brightness-105'
          } ${reachedDailyLimit ? 'cursor-not-allowed' : ''}`}
          disabled={reachedDailyLimit}
          style={{
            width: `${IMAGE_CONFIG.width}px`,
            height: `${IMAGE_CONFIG.height}px`
          }}
        >
          {!imageLoaded ? (
            <div 
              className="bg-gray-200 rounded-full animate-pulse"
              style={{
                width: `${IMAGE_CONFIG.width}px`,
                height: `${IMAGE_CONFIG.height}px`
              }}
            />
          ) : (
            <img
              src={IMAGE_CONFIG.imageUrl}
              alt="Tap Freud"
              className="object-contain relative z-10"
              draggable="false"
              style={{
                width: `${IMAGE_CONFIG.width}px`,
                height: `${IMAGE_CONFIG.height}px`
              }}
            />
          )}
          
          {showPoints && (
            <div 
              className="absolute text-[#865df6] font-bold text-2xl animate-points pointer-events-none z-20"
              style={{
                left: `${pointsPosition.x}px`,
                top: `${pointsPosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              +2
            </div>
          )}
        </button>
      </div>

      <div className="mt-4 w-full">
        <FreudTitle />
      </div>

      {/* Tap Progress */}
      <TapProgress currentTaps={tapCount} maxTaps={10} />
    </div>
  );
}