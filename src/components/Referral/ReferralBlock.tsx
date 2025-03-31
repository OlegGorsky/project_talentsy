import React, { useEffect, useState } from 'react';
import { Share2, Copy, Check, Gift, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Quiz } from '../Quiz/Quiz';
import { ReferralRulesModal } from './ReferralRulesModal';

interface ReferralBlockProps {
  invitedCount: number;
  onShare: () => void;
  onCopy: () => void;
}

export function ReferralBlock({ invitedCount: initialCount }: ReferralBlockProps) {
  const [referralCount, setReferralCount] = useState(initialCount);
  const [referralLink, setReferralLink] = useState('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const getUserId = () => {
      const tg = window.Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id;
      }
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('user_id') || 'test_user_123';
    };

    const userId = getUserId();

    // Create referral link
    const referralData = {
      referrer_id: userId
    };
    const base64Data = btoa(JSON.stringify(referralData));
    const link = `https://t.me/talentsy_kds_bot/app?startapp=${base64Data}`;
    setReferralLink(link);

    // Check quiz completion status
    const checkQuizCompletion = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_completions')
          .select('completed_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;
        setQuizCompleted(!!data);
      } catch (error) {
        console.error('Error checking quiz completion:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch referral count
    const fetchReferralCount = async () => {
      try {
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact' })
          .eq('referrer_id', userId);
        
        setReferralCount(count || 0);
      } catch (error) {
        console.error('Error fetching referral count:', error);
      }
    };

    checkQuizCompletion();
    fetchReferralCount();

    // Subscribe to referral changes
    const channel = supabase
      .channel('referrals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${userId}`,
        },
        () => {
          fetchReferralCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleShare = () => {
    const tg = window.Telegram?.WebApp;
    const shareText = 'Привет! Участвую в розыгрыше от университета Talentsy. Присоединяйся)';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    
    if (tg) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setShowCopyNotification(true);
    setTimeout(() => {
      setShowCopyNotification(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-3 mt-1">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!quizCompleted) {
    return (
      <div className="mt-4">
        <div className="bg-[#865df6] text-white p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-3">
            <Gift size={24} />
            <div>
              <h2 className="text-lg font-semibold">Пройдите опрос</h2>
              <p className="text-sm opacity-90">Получите 200 баллов за прохождение опроса</p>
            </div>
          </div>
        </div>
        <Quiz
          onComplete={() => setQuizCompleted(true)}
          onClose={() => {}} // Empty function since we don't need close functionality
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-3 mt-1 relative">
      <div className="max-w-[280px]">
        <h2 className="text-sm font-bold text-gray-900 leading-tight">
          ПРИГЛАШАЙ ДРУЗЕЙ И ЗАРАБАТЫВАЙ БАЛЛЫ!
        </h2>
        <button
          onClick={() => setShowRules(true)}
          className="text-xs text-[#865df6] font-medium hover:text-[#7147f5] transition-colors mt-0.5"
        >
          Правила розыгрыша
        </button>
      </div>
      
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 bg-[#865df6] text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-[#7147f5] transition-colors"
        >
          <Share2 size={18} className="mr-2" />
          Отправить ссылку
        </button>
        <button
          onClick={handleCopy}
          className="w-10 h-10 bg-[#865df6] text-white rounded-lg flex items-center justify-center hover:bg-[#7147f5] transition-colors relative"
        >
          {showCopyNotification ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          Вы пригласили: <span className="font-medium">{referralCount}</span> друзей
        </p>
      </div>

      {showCopyNotification && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black bg-opacity-75 text-white text-sm py-1 px-3 rounded-lg">
          Ссылка скопирована
        </div>
      )}

      {/* Rules Modal */}
      {showRules && <ReferralRulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}