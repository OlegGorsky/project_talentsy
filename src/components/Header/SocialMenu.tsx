import React from 'react';
import { Globe, Youtube, Gift } from 'lucide-react';
import { RulesModal } from '../Modals/RulesModal';

interface SocialMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SocialMenu({ isOpen, onToggle }: SocialMenuProps) {
  const [showRules, setShowRules] = React.useState(false);

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowRules(true)}
          className="px-4 py-1.5 bg-[#865df6] text-white text-sm font-medium rounded-full hover:bg-[#7147f5] transition-colors flex items-center space-x-1"
        >
          <Gift size={16} className="mr-1" />
          <span>Правила</span>
        </button>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border">
          <a
            href="https://talentsy.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-gray-900 hover:bg-gray-100"
          >
            <Globe size={18} className="mr-3" />
            Сайт
          </a>
          <a
            href="https://www.youtube.com/@zakroygeshtalt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-gray-900 hover:bg-gray-100"
          >
            <Youtube size={18} className="mr-3" />
            YouTube
          </a>
        </div>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}