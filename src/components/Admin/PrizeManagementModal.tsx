import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PrizeExchange {
  id: string;
  prize_name: string;
  points_spent: number;
  created_at: string;
}

interface PrizeManagementModalProps {
  user: {
    telegram_id: string;
    first_name: string;
    prize_exchanges: PrizeExchange[];
  };
  onClose: () => void;
  onRefresh: () => void;
}

export function PrizeManagementModal({ user, onClose, onRefresh }: PrizeManagementModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePrize = async (prizeId: string, pointsSpent: number) => {
    if (isDeleting) return;
    if (!confirm('Вы уверены, что хотите удалить этот приз?')) return;

    setIsDeleting(true);
    try {
      // Delete prize exchange
      const { error: deleteError } = await supabase
        .from('prize_exchanges')
        .delete()
        .eq('id', prizeId);

      if (deleteError) throw deleteError;

      // Return points to user
      await supabase.rpc('add_referral_points', {
        user_id: user.telegram_id,
        points_to_add: pointsSpent
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting prize:', error);
      alert('Ошибка при удалении приза');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold">Управление призами</h3>
            <p className="text-sm text-gray-500 mt-1">Пользователь: {user.first_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {user.prize_exchanges.length > 0 ? (
          <div className="space-y-4">
            {user.prize_exchanges.map((prize) => (
              <div key={prize.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{prize.prize_name}</p>
                  <p className="text-sm text-gray-500">{prize.points_spent} баллов</p>
                  <p className="text-xs text-gray-400">
                    {new Date(prize.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePrize(prize.id, prize.points_spent)}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Нет полученных призов
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}