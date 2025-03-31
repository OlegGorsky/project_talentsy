import React from 'react';
import { Home, CheckCircle, ShoppingBag, Trophy, Gift } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center py-3">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center transition-colors ${
              activeTab === 'home'
                ? 'text-[#865df6]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Главная</span>
          </button>
          <button
            onClick={() => onTabChange('prizes')}
            className={`flex flex-col items-center transition-colors ${
              activeTab === 'prizes'
                ? 'text-[#865df6]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Gift size={24} strokeWidth={activeTab === 'prizes' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Призы</span>
          </button>
          <button
            onClick={() => onTabChange('tasks')}
            className={`flex flex-col items-center transition-colors ${
              activeTab === 'tasks'
                ? 'text-[#865df6]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <CheckCircle size={24} strokeWidth={activeTab === 'tasks' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Задания</span>
          </button>
          <button
            onClick={() => onTabChange('shop')}
            className={`flex flex-col items-center transition-colors ${
              activeTab === 'shop'
                ? 'text-[#865df6]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShoppingBag size={24} strokeWidth={activeTab === 'shop' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Магазин</span>
          </button>
          <button
            onClick={() => onTabChange('rating')}
            className={`flex flex-col items-center transition-colors ${
              activeTab === 'rating'
                ? 'text-[#865df6]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Trophy size={24} strokeWidth={activeTab === 'rating' ? 2.5 : 2} />
            <span className="text-xs mt-1 font-medium">Рейтинг</span>
          </button>
        </div>
      </div>
    </div>
  );
}