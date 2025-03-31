import React, { useState, useEffect } from 'react';
import { X, Coins, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Prize {
  id: number;
  name: string;
  points: number;
  description: string;
  botUrl: string;
  imageUrl: string;
}

interface PrizeModalProps {
  prize: Prize;
  onClose: () => void;
}

interface ConfirmationModalProps {
  prize: Prize;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmationModal({ prize, onClose, onConfirm }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-500">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-semibold">Подтверждение обмена</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Вы уверены, что хотите обменять {prize.points} баллов на "{prize.name}"?
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#865df6] text-white px-4 py-2 rounded-lg hover:bg-[#7147f5] transition-colors"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

interface SuccessModalProps {
  prize: Prize;
  onClose: () => void;
}

function SuccessModal({ prize, onClose }: SuccessModalProps) {
  const handleGoToBot = () => {
    window.open(prize.botUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Успешный обмен</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          У вас списано {prize.points} баллов за "{prize.name}". Чтобы получить доступ к практикуму, перейдите в телеграм-бот, нажав кнопку ниже.
        </p>

        <button
          onClick={handleGoToBot}
          className="w-full bg-[#865df6] text-white py-3 rounded-lg font-medium hover:bg-[#7147f5] transition-colors"
        >
          Перейти в бот
        </button>
      </div>
    </div>
  );
}

export function PrizeModal({ prize, onClose }: PrizeModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [hasExchanged, setHasExchanged] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const checkExchange = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user?.id) return;

      try {
        // Check if user has already exchanged this prize
        const { data: exchangeData, error: exchangeError } = await supabase
          .from('prize_exchanges')
          .select('id')
          .eq('user_id', tg.initDataUnsafe.user.id)
          .eq('prize_id', prize.id)
          .maybeSingle();

        if (exchangeError) throw exchangeError;
        setHasExchanged(!!exchangeData);

        // Get user's current points
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('points')
          .eq('telegram_id', tg.initDataUnsafe.user.id)
          .single();

        if (userError) throw userError;
        setUserPoints(userData?.points || 0);
      } catch (error) {
        console.error('Error checking exchange:', error);
      }
    };

    checkExchange();
  }, [prize.id]);

  const handleExchange = async () => {
    if (exchanging) return;

    setExchanging(true);
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user?.id) return;

    try {
      // Check if user has enough points
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('telegram_id', tg.initDataUnsafe.user.id)
        .single();

      if (userError) throw userError;

      if (!userData || userData.points < prize.points) {
        alert('Недостаточно баллов для обмена');
        setShowConfirmation(false);
        return;
      }

      // Update user's points
      const { error: updateError } = await supabase
        .from('users')
        .update({ points: userData.points - prize.points })
        .eq('telegram_id', tg.initDataUnsafe.user.id);

      if (updateError) throw updateError;

      // Record the exchange
      const { error: exchangeError } = await supabase
        .from('prize_exchanges')
        .insert([{
          user_id: tg.initDataUnsafe.user.id,
          prize_id: prize.id,
          prize_name: prize.name,
          points_spent: prize.points,
          bot_url: prize.botUrl
        }]);

      if (exchangeError) throw exchangeError;

      setShowConfirmation(false);
      setShowSuccess(true);
      setHasExchanged(true);
      setUserPoints(userData.points - prize.points);
    } catch (error) {
      console.error('Error processing exchange:', error);
      alert('Произошла ошибка при обмене. Пожалуйста, попробуйте позже.');
      setShowConfirmation(false);
    } finally {
      setExchanging(false);
    }
  };

  if (hasExchanged) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">Практикум уже получен</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Вы уже обменяли баллы на этот практикум. Чтобы получить доступ, перейдите в телеграм-бот.
          </p>

          <button
            onClick={() => window.open(prize.botUrl, '_blank')}
            className="w-full bg-[#865df6] text-white py-3 rounded-lg font-medium hover:bg-[#7147f5] transition-colors"
          >
            Перейти в бот
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return <ConfirmationModal prize={prize} onClose={() => setShowConfirmation(false)} onConfirm={handleExchange} />;
  }

  if (showSuccess) {
    return <SuccessModal prize={prize} onClose={onClose} />;
  }

  const canExchange = userPoints >= prize.points;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <div className="p-6">
          <div className="w-48 h-48 mx-auto">
            <img
              src={prize.imageUrl}
              alt={prize.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-center mb-2">{prize.name}</h3>
            <p className="text-gray-600 text-center mb-4">{prize.description}</p>
            <div className="bg-[#865df6] bg-opacity-10 rounded-lg p-4 flex items-center justify-center mb-4">
              <Coins className="text-[#865df6] mr-2" size={20} />
              <span className="text-[#865df6] font-medium">{prize.points} баллов</span>
            </div>
            {!canExchange && (
              <p className="text-red-500 text-sm text-center mb-4">
                Недостаточно баллов для обмена. У вас {userPoints} баллов.
              </p>
            )}
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={!canExchange}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                canExchange
                  ? 'bg-[#865df6] text-white hover:bg-[#7147f5]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canExchange ? 'Обменять' : 'Недостаточно баллов'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}