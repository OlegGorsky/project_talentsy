import React, { useEffect, useState } from 'react';
import { UserProfile } from './components/Header/UserProfile';
import { SocialMenu } from './components/Header/SocialMenu';
import { PrizeModal } from './components/Prizes/PrizeModal';
import { BottomNav } from './components/Navigation/BottomNav';
import { TabContent } from './components/Tabs/TabContent';
import { HomeContent } from './components/HomeContent';
import { Splash } from './components/Splash/Splash';
import { AdminPanel } from './components/Admin/AdminPanel';
import { ArticlePage } from './components/Article/ArticlePage';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
        };
        headerColor: string;
        backgroundColor: string;
        initData: string;
        initDataUnsafe: {
          user?: {
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            id?: string;
          };
          start_param?: string;
        };
        platform?: string;
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
        setBackgroundColor: (color: string) => void;
        setHeaderColor: (color: string) => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
      };
    };
  }
}

const prizes = [
  { 
    id: 1, 
    name: 'Найди свой путь: практикум по поиску призвания', 
    points: 600, 
    description: 'Пошаговая система для тех, кто хочет понять свои цели, найти дело по душе и перестать сомневаться в своём выборе.',
    botUrl: 'https://salebot.site/talentsy_ref1_1',
    imageUrl: 'https://files.salebot.pro/uploads/file_item/file/535162/3D_book__1_.png'
  },
  { 
    id: 2, 
    name: 'Практикум «Путь к уверенности»', 
    points: 600, 
    description: 'Пошаговая система для тех, кто устал сомневаться в себе, хочет обрести уверенность и повысить самооценку.',
    botUrl: 'https://salebot.site/talensy_ref2_1',
    imageUrl: 'https://files.salebot.pro/uploads/file_item/file/535162/3D_book.png'
  }
];

function App() {
  const [user, setUser] = useState<{
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    id?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<typeof prizes[0] | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showArticle, setShowArticle] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();

      // Set white background and header
      tg.headerColor = '#ffffff';
      tg.backgroundColor = '#ffffff';

      // Get user data
      if (tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user);
      }

      // Check if desktop platform or tablet
      const isDesktopPlatform = tg.platform && ['macos', 'windows', 'linux'].includes(tg.platform);
      const isTablet = window.innerWidth >= 768; // Basic tablet detection
      const shouldScale = isDesktopPlatform || isTablet;

      if (shouldScale) {
        setIsDesktop(true);
        document.body.classList.add('telegram-webapp', 'desktop');

        // Set fixed size for desktop WebApp
        const style = document.createElement('style');
        style.textContent = `
          html, body {
            width: 420px !important;
            height: ${tg.viewportStableHeight || 680}px !important;
            margin: 0 auto !important;
            overflow: hidden !important;
            position: relative !important;
          }
          #root {
            height: 100% !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .telegram-webapp.desktop {
            max-width: 420px !important;
          }
        `;
        document.head.appendChild(style);

        // Force expand for desktop
        const expandWebApp = () => {
          if (!tg.isExpanded) {
            tg.expand();
            requestAnimationFrame(expandWebApp);
          }
        };
        expandWebApp();

        // Set initial viewport height
        setViewportHeight(tg.viewportStableHeight || tg.viewportHeight);
        document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportStableHeight || tg.viewportHeight}px`);
        document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);

        // Handle viewport resize
        const handleResize = () => {
          tg.expand();
          const newHeight = tg.viewportStableHeight || tg.viewportHeight;
          setViewportHeight(newHeight);
          document.documentElement.style.setProperty('--tg-viewport-height', `${newHeight}px`);
          document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
        };

        tg.onEvent('viewportChanged', handleResize);
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          tg.offEvent('viewportChanged', handleResize);
        };
      } else {
        document.body.classList.add('telegram-webapp');
      }
    } else {
      // For non-Telegram environment
      const mockUser = {
        id: 'test_user_123',
        first_name: 'Test User',
        username: 'testuser',
        photo_url: undefined
      };
      setUser(mockUser);

      // Check if desktop
      if (window.innerWidth >= 768) {
        setIsDesktop(true);
        document.body.classList.add('telegram-webapp', 'desktop');
      }
    }
  }, []);

  const handleShare = () => {
    // Implement share functionality
    console.log('Share link');
  };

  const handleCopy = () => {
    // Implement copy functionality
    console.log('Copy link');
  };

  // Define onPrizeSelect function
  const onPrizeSelect = (prize: typeof prizes[0]) => {
    setSelectedPrize(prize);
  };

  // Show admin panel if path is /admin2
  if (window.location.pathname.includes('admin2')) {
    return (
      <AdminPanel 
        onBack={() => {
          window.location.href = window.location.origin;
        }} 
      />
    );
  }

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  if (showArticle) {
    return <ArticlePage onBack={() => setShowArticle(false)} />;
  }

  return (
    <div 
      className={`min-h-screen bg-white flex flex-col ${isDesktop ? 'desktop-view' : ''}`}
      style={{ height: `var(--tg-viewport-height, ${viewportHeight}px)` }}
    >
      {/* Header */}
      <div className="p-4 md:px-6 lg:px-8 sticky top-0 bg-white z-20 border-b">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <UserProfile user={user} />
          <SocialMenu isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} />
        </div>
      </div>

      {/* Main Content */}
      <TabContent
        activeTab={activeTab}
        prizes={prizes}
        onPrizeSelect={onPrizeSelect}
        onShowArticle={() => setShowArticle(true)}
        onTabChange={setActiveTab}
      />

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t z-20">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Prize Modal */}
      {selectedPrize && (
        <PrizeModal prize={selectedPrize} onClose={() => setSelectedPrize(null)} />
      )}
    </div>
  );
}

export default App;