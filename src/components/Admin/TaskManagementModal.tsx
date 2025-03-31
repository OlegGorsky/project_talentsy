import React, { useState } from 'react';
import { X, BookOpen, Send, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TaskManagementModalProps {
  user: {
    telegram_id: string;
    first_name: string;
    quiz_completed: boolean;
    keyword_completed: boolean;
    telegram_subscribed: boolean;
  };
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskManagementModal({ user, onClose, onRefresh }: TaskManagementModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTask = async (taskType: string) => {
    if (isDeleting) return;
    if (!confirm(`Вы уверены, что хотите удалить это задание?`)) return;

    setIsDeleting(true);
    try {
      let updateData = {};
      let pointsToDeduct = 0;

      switch (taskType) {
        case 'quiz':
          await supabase.from('quiz_completions').delete().eq('user_id', user.telegram_id);
          pointsToDeduct = 200;
          break;
        case 'keyword':
          updateData = { keyword_completed: false };
          pointsToDeduct = 100;
          break;
        case 'telegram':
          await supabase.from('telegram_subscriptions').delete().eq('user_id', user.telegram_id);
          pointsToDeduct = 150;
          break;
      }

      // Update user points and status if needed
      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('users')
          .update(updateData)
          .eq('telegram_id', user.telegram_id);
      }

      // Deduct points
      if (pointsToDeduct > 0) {
        await supabase.rpc('add_referral_points', {
          user_id: user.telegram_id,
          points_to_add: -pointsToDeduct
        });
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Ошибка при удалении задания');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold">Управление заданиями</h3>
            <p className="text-sm text-gray-500 mt-1">Пользователь: {user.first_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Quiz Task */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <BookOpen className={user.quiz_completed ? "text-green-500 mr-3" : "text-gray-400 mr-3"} size={20} />
              <div>
                <p className="font-medium">Опрос</p>
                <p className="text-sm text-gray-500">200 баллов</p>
              </div>
            </div>
            {user.quiz_completed && (
              <button
                onClick={() => handleDeleteTask('quiz')}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {/* Keyword Task */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <BookOpen className={user.keyword_completed ? "text-green-500 mr-3" : "text-gray-400 mr-3"} size={20} />
              <div>
                <p className="font-medium">Ключевое слово</p>
                <p className="text-sm text-gray-500">100 баллов</p>
              </div>
            </div>
            {user.keyword_completed && (
              <button
                onClick={() => handleDeleteTask('keyword')}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {/* Telegram Subscription Task */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Send className={user.telegram_subscribed ? "text-green-500 mr-3" : "text-gray-400 mr-3"} size={20} />
              <div>
                <p className="font-medium">Подписка на канал</p>
                <p className="text-sm text-gray-500">150 баллов</p>
              </div>
            </div>
            {user.telegram_subscribed && (
              <button
                onClick={() => handleDeleteTask('telegram')}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

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