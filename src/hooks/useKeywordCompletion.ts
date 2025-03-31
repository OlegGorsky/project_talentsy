import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useKeywordCompletion() {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkCompletion = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('keyword_completed')
          .eq('telegram_id', tg.initDataUnsafe.user.id)
          .single();

        if (error) throw error;
        setCompleted(data?.keyword_completed || false);
      } catch (error) {
        console.error('Error checking completion:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCompletion();
  }, []);

  const submitKeyword = async (keyword: string) => {
    if (!keyword.trim()) {
      throw new Error('Введите ключевое слово');
    }

    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user?.id) {
      throw new Error('Пользователь не найден');
    }

    if (isSubmitting || completed) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (keyword.toLowerCase() === 'talentsy') {
        // Call the RPC function to complete the task
        const { data, error } = await supabase
          .rpc('complete_keyword_task', {
            user_id_param: tg.initDataUnsafe.user.id
          });

        if (error) {
          throw new Error('Ошибка при выполнении задания');
        }

        if (!data) {
          throw new Error('Вы уже получили баллы за это задание');
        }

        setCompleted(true);
        return true;
      } else {
        throw new Error('Неверное ключевое слово');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Произошла ошибка. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completed,
    loading,
    isSubmitting,
    submitKeyword
  };
}