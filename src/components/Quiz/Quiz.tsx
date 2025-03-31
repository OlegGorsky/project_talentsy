import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface QuizProps {
  onComplete: () => void;
  onClose: () => void;
}

const QUESTIONS = [
  {
    question: 'Знакомимся с Talentsy! Как ты думаешь, сколько суммарно учеников обучалось в нашем онлайн-университете?',
    options: [
      '600 учеников',
      '2.500 учеников',
      '13.000 учеников'
    ],
    feedback: 'На сегодняшний день у Talentsy уже более 13 тысяч любимых студентов! Наши ученики живут по всему миру и активно строят карьеру благодаря полученным знаниям'
  },
  {
    question: 'Почему нашим ученикам нравится учиться в Talentsy?',
    options: [
      'Фундаментальные программы обучения',
      'Преподаватели высокого уровня',
      'Помощь в привлечении первых клиентов',
      'Все в комплексе'
    ],
    feedback: 'Конечно же, за комплексный подход! У нас современные обучающие программы гос. стандартов уровня ВУЗа, преподаватели - специалисты высочайшего класса и опыта, и мы действительно помогаем с привлечением первых клиентов. А также организовываем яркую студенческую жизнь и поддержку на всех этапах обучения.'
  },
  {
    question: 'Сколько дипломов получает выпускник обучающих программ Talentsy?',
    options: [
      'один',
      'два',
      'обучение без дипломов'
    ],
    feedback: 'Наши выпускники получают 2 диплома: Российский о профессиональной переподготовке установленного образца РФ и Международный диплом MBA два сертификата от аккредитующих центров Великобритании.'
  },
  {
    question: 'Сколько времени, по вашему мнению, нужно, чтобы освоить одну из профессий в Talentsy?',
    options: [
      '3-4 месяца',
      '6-12 месяцев',
      'Больше года'
    ],
    feedback: 'Всего за 3–6 месяцев студенты Talentsy начинают осваивать профессию и работать по новым знаниям, а многие уже находят клиентов и строят карьеру во время обучения. Все зависит от ваших целей и усилий!'
  },
  {
    question: 'Какая из профессий, на ваш взгляд, самая популярная среди наших студентов?',
    options: [
      'Дизайнер интерьера',
      'Психолог-консультант',
      'Интегративный нутрициолог'
    ],
    feedback: 'Самая популярная профессия у нас — это психолог-консультант! Но Talentsy предлагает обучение и по другим востребованным направлениям: от дизайна до нутрициологии. Каждый найдет то, что подходит именно ему.'
  }
];

export function Quiz({ onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const getUserId = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      return tg.initDataUnsafe.user.id;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user_id') || 'test_user_123';
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || isCompleting) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNext = async () => {
    if (currentQuestion === QUESTIONS.length - 1) {
      setIsCompleting(true);
      
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error('No user ID found');
        }

        // Record quiz completion
        const { error: completionError } = await supabase
          .from('quiz_completions')
          .insert([{ user_id: userId }]);

        if (completionError && completionError.code !== '23505') {
          throw new Error(`Error recording quiz completion: ${completionError.message}`);
        }

        // Complete the quiz
        onComplete();
      } catch (error) {
        console.error('Error completing quiz:', error);
        // Still complete the quiz even if there's an error
        onComplete();
      } finally {
        setIsCompleting(false);
      }
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="bg-[#865df6] bg-opacity-5 rounded-xl overflow-hidden shadow-sm">
      {/* Progress bar */}
      <div className="h-1 bg-[#865df6] bg-opacity-10">
        <div
          className="h-full bg-[#865df6] transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="p-4">
        {selectedAnswer === null ? (
          <>
            <p className="text-base font-medium text-gray-900 mb-4 text-center">
              {QUESTIONS[currentQuestion].question}
            </p>

            {/* Options */}
            <div className="space-y-2">
              {QUESTIONS[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null || isCompleting}
                  className="w-full p-3 rounded-lg text-left transition-all text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-100 hover:border-[#865df6] hover:shadow-sm"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Feedback */
          <div className="space-y-4">
            <p className="text-base font-medium text-gray-900 text-center py-4">
              {QUESTIONS[currentQuestion].feedback}
            </p>

            <button
              onClick={handleNext}
              disabled={isCompleting}
              className="w-full bg-[#865df6] text-white py-2.5 rounded-lg font-medium hover:bg-[#7147f5] transition-colors disabled:opacity-50"
            >
              {currentQuestion === QUESTIONS.length - 1 ? 'Забрать 200 баллов!' : 'Следующий вопрос'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}