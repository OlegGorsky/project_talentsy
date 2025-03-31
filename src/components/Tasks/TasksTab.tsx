import React, { useState, useEffect } from 'react';
import { CheckCircle, BookOpen, Send, Gift, ArrowRight, X, Users } from 'lucide-react';
import { KeywordTask } from './KeywordTask';
import { TelegramSubscriptionTask } from './TelegramSubscriptionTask';
import { Quiz } from '../Quiz/Quiz';
import { ReferralBlock } from '../Referral/ReferralBlock';
import { supabase } from '../../lib/supabase';

interface TasksTabProps {
  onShowArticle: () => void;
}

interface TaskModalProps {
  title: string;
  description: string;
  points: number;
  onClose: () => void;
  children: React.ReactNode;
}

function TaskModal({ title, description, points, onClose, children }: TaskModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white hover:text-white/80 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="bg-[#865df6] text-white p-6">
          <h3 className="text-xl font-semibold pr-8">{title}</h3>
          <p className="text-sm mt-1 opacity-90">{description}</p>
          <div className="mt-3 inline-flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
            <Gift size={16} className="mr-1" />
            <span className="text-sm font-medium">{points} баллов</span>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function CompletedQuizMessage({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-green-50 text-green-700 p-6 rounded-lg text-center">
      <CheckCircle className="mx-auto mb-4" size={32} />
      <h3 className="text-lg font-semibold mb-2">Опрос пройден!</h3>
      <p className="text-sm mb-4">Вы уже получили 200 баллов за прохождение опроса</p>
      <button
        onClick={onClose}
        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        Закрыть
      </button>
    </div>
  );
}

export function TasksTab({ onShowArticle }: TasksTabProps) {
  const [selectedTask, setSelectedTask] = useState<'quiz' | 'telegram' | 'article' | 'referral' | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [telegramCompleted, setTelegramCompleted] = useState(false);
  const [keywordCompleted, setKeywordCompleted] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const checkCompletions = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user?.id) return;

      try {
        const [
          { data: quizData },
          { data: telegramData },
          { data: userData },
          { count: referralCount }
        ] = await Promise.all([
          supabase
            .from('quiz_completions')
            .select('completed_at')
            .eq('user_id', tg.initDataUnsafe.user.id)
            .maybeSingle(),
          supabase
            .from('telegram_subscriptions')
            .select('subscribed_at')
            .eq('user_id', tg.initDataUnsafe.user.id)
            .maybeSingle(),
          supabase
            .from('users')
            .select('keyword_completed')
            .eq('telegram_id', tg.initDataUnsafe.user.id)
            .single(),
          supabase
            .from('referrals')
            .select('*', { count: 'exact' })
            .eq('referrer_id', tg.initDataUnsafe.user.id)
        ]);

        setQuizCompleted(!!quizData);
        setTelegramCompleted(!!telegramData);
        setKeywordCompleted(userData?.keyword_completed || false);
        setReferralCount(referralCount || 0);
      } catch (error) {
        console.error('Error checking completions:', error);
      }
    };

    checkCompletions();

    // Subscribe to changes
    const channels = [
      'quiz_completions',
      'telegram_subscriptions',
      'users',
      'referrals'
    ].map(table => 
      supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => checkCompletions()
        )
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const handleQuizComplete = () => {
    setQuizCompleted(true);
    setSelectedTask(null);
  };

  const tasks = [
    {
      id: 'quiz',
      title: 'Пройдите опрос',
      description: 'Ответьте на несколько вопросов о Talentsy',
      points: 200,
      icon: CheckCircle,
      completed: quizCompleted,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'article',
      title: 'Введи ключевое слово',
      description: 'Прочитай статью, найди ключевое слово и напиши его ниже',
      points: 100,
      icon: BookOpen,
      completed: keywordCompleted,
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 'telegram',
      title: 'Подпишись на Телеграм-канал',
      description: 'Подпишитесь на наш Telegram канал',
      points: 150,
      icon: Send,
      completed: telegramCompleted,
      color: 'bg-pink-50 text-pink-600'
    },
    {
      id: 'referral',
      title: 'Приглашайте друзей',
      description: 'Получайте баллы за каждого приглашенного друга',
      points: 100,
      icon: Users,
      completed: false,
      color: 'bg-blue-50 text-blue-600',
      badge: referralCount > 0 ? referralCount : undefined
    }
  ];

  const renderTaskContent = () => {
    switch (selectedTask) {
      case 'quiz':
        return (
          <TaskModal
            title="Пройдите опрос"
            description="Ответьте на несколько вопросов о Talentsy"
            points={200}
            onClose={() => setSelectedTask(null)}
          >
            {quizCompleted ? (
              <CompletedQuizMessage onClose={() => setSelectedTask(null)} />
            ) : (
              <Quiz onComplete={handleQuizComplete} onClose={() => setSelectedTask(null)} />
            )}
          </TaskModal>
        );
      case 'telegram':
        return (
          <TaskModal
            title="Подпишись на Телеграм-канал"
            description="Подпишитесь на наш Telegram канал и получите баллы"
            points={150}
            onClose={() => setSelectedTask(null)}
          >
            <TelegramSubscriptionTask channelUsername="talentsy_official" />
          </TaskModal>
        );
      case 'article':
        return (
          <TaskModal
            title="Введи ключевое слово"
            description="Прочитай статью, найди ключевое слово и напиши его ниже"
            points={100}
            onClose={() => setSelectedTask(null)}
          >
            <KeywordTask onShowArticle={onShowArticle} />
          </TaskModal>
        );
      case 'referral':
        return (
          <TaskModal
            title="Приглашайте друзей"
            description="За каждого приглашенного друга вы получите 100 баллов"
            points={100}
            onClose={() => setSelectedTask(null)}
          >
            <ReferralBlock
              invitedCount={referralCount}
              onShare={() => {}}
              onCopy={() => {}}
            />
          </TaskModal>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4">
        <div className="bg-[#865df6] text-white p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle size={24} />
            <div>
              <h2 className="text-lg font-semibold">Задания</h2>
              <p className="text-sm opacity-90">Выполняйте задания и получайте баллы</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4">
        <div className="space-y-3">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task.id as any)}
              className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow transition-shadow relative overflow-hidden"
            >
              {/* Task Content */}
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.color}`}>
                  <task.icon size={24} />
                </div>
                <div className="flex-1 text-left flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-[#865df6]">
                      <Gift size={16} className="mr-1" />
                      <span className="text-sm font-medium">{task.points}</span>
                    </div>
                    {task.completed ? (
                      <div className="bg-green-50 text-green-600 text-sm px-3 py-1 rounded-full font-medium">
                        Выполнено
                      </div>
                    ) : task.badge ? (
                      <div className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full font-medium">
                        {task.badge} друзей
                      </div>
                    ) : (
                      <ArrowRight size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              {task.completed && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {renderTaskContent()}
    </div>
  );
}