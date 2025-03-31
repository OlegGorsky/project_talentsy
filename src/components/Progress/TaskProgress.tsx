import React, { useEffect, useState } from 'react';
import { CheckCircle, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TaskProgress {
  quiz: boolean;
  article: boolean;
  telegram: boolean;
  referralCount: number;
}

export function TaskProgress() {
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({
    quiz: false,
    article: false,
    telegram: false,
    referralCount: 0
  });

  useEffect(() => {
    const fetchTaskProgress = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user?.id) return;

      try {
        const [
          { data: quizData },
          { data: userData },
          { data: telegramData },
          { count: referralCount }
        ] = await Promise.all([
          supabase
            .from('quiz_completions')
            .select('completed_at')
            .eq('user_id', tg.initDataUnsafe.user.id)
            .maybeSingle(),
          supabase
            .from('users')
            .select('keyword_completed')
            .eq('telegram_id', tg.initDataUnsafe.user.id)
            .single(),
          supabase
            .from('telegram_subscriptions')
            .select('subscribed_at')
            .eq('user_id', tg.initDataUnsafe.user.id)
            .maybeSingle(),
          supabase
            .from('referrals')
            .select('*', { count: 'exact' })
            .eq('referrer_id', tg.initDataUnsafe.user.id)
        ]);

        setTaskProgress({
          quiz: !!quizData,
          article: userData?.keyword_completed || false,
          telegram: !!telegramData,
          referralCount: referralCount || 0
        });
      } catch (error) {
        console.error('Error fetching task progress:', error);
      }
    };

    fetchTaskProgress();

    // Set up real-time subscription
    const channel = supabase
      .channel('task_progress_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => fetchTaskProgress()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const completedTasks = Object.values(taskProgress).filter(value => 
    typeof value === 'boolean' && value
  ).length;
  const totalTasks = Object.values(taskProgress).filter(value => 
    typeof value === 'boolean'
  ).length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="mt-8 space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <CheckCircle className="text-[#865df6] mr-2" size={20} />
            <span className="font-medium">Прогресс заданий</span>
          </div>
          <span className="text-sm text-gray-500">
            {completedTasks} из {totalTasks}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#865df6] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="text-[#865df6] mr-2" size={20} />
            <span className="font-medium">Приглашено друзей</span>
          </div>
          <span className="bg-[#865df6] text-white px-3 py-1 rounded-full text-sm">
            {taskProgress.referralCount}
          </span>
        </div>
      </div>
    </div>
  );
}