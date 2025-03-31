import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star, Award, BookOpen, Users, Briefcase, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ArticlePageProps {
  onBack: () => void;
}

export function ArticlePage({ onBack }: ArticlePageProps) {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b z-10">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-2 text-lg font-semibold">О нас</h1>
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="pb-8">
          {/* Top Banner */}
          <div className="w-full h-48 bg-[#865df6] relative overflow-hidden">
            <img
              src="https://files.salebot.pro/uploads/file_item/file/535162/Screenshot__22_.png"
              alt="Talentsy Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          </div>

          <div className="px-4 pt-6">
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                Talentsy – онлайн-университет помогающих профессий
              </h2>
              <p className="text-lg text-gray-600">
                Мы помогаем найти любимое дело и начать на нем зарабатывать.
              </p>
            </div>

            {/* Key Facts Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#865df6] bg-opacity-5 rounded-xl p-4 flex flex-col items-center text-center">
                <BookOpen className="text-[#865df6] mb-2" size={24} />
                <div className="font-semibold">5 факультетов</div>
              </div>
              <div className="bg-[#865df6] bg-opacity-5 rounded-xl p-4 flex flex-col items-center text-center">
                <Award className="text-[#865df6] mb-2" size={24} />
                <div className="font-semibold">20 программ</div>
              </div>
              <div className="bg-[#865df6] bg-opacity-5 rounded-xl p-4 flex flex-col items-center text-center">
                <Users className="text-[#865df6] mb-2" size={24} />
                <div className="font-semibold">70+ преподавателей</div>
              </div>
              <div className="bg-[#865df6] bg-opacity-5 rounded-xl p-4 flex flex-col items-center text-center">
                <Star className="text-[#865df6] mb-2" size={24} />
                <div className="font-semibold">15 000+ студентов</div>
              </div>
            </div>

            {/* License Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Briefcase className="text-[#865df6] mr-2" size={24} />
                Государственная лицензия и дипломы
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="text-[#865df6] mt-1 mr-3 flex-shrink-0" size={18} />
                  <p className="text-gray-600">Диплом о профессиональной переподготовке установленного образца</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-[#865df6] mt-1 mr-3 flex-shrink-0" size={18} />
                  <p className="text-gray-600">Международный диплом MBA от Open European Academy (г. Прага)</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-[#865df6] mt-1 mr-3 flex-shrink-0" size={18} />
                  <p className="text-gray-600">2 международных сертификата от аккредитующих центров Великобритании</p>
                </div>
              </div>
            </div>

            {/* Psychology Faculty */}
            <div className="bg-[#865df6] text-white rounded-xl p-6 mb-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Например, на факультете психологии мы готовим по следующим специализациям:</h4>
                  <ul className="space-y-2 opacity-90">
                    <li className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Семейный психолог
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Детский психолог
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Консультант в сфере сексуальных отношений
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">И в рамках обучения можете освоить:</h4>
                  <ul className="space-y-2 opacity-90">
                    <li className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Когнитивно-поведенческий подход
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Гештальт-подход
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      Краткосрочную терапию
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Education Process */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold">Как мы обеспечиваем эффективность обучения</h3>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-medium text-gray-900 mb-3">Собственная платформа</h4>
                <p className="text-gray-600">
                  Интуитивно понятный интерфейс, отдельный глоссарий и структурированные разделы. Доступ к платформе остается навсегда.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-medium text-gray-900 mb-3">Практический подход</h4>
                <p className="text-gray-600">
                  30% теории и 70% практики. Еженедельные практические занятия в мини-группах под руководством практикующего психолога.
                </p>
              </div>
            </div>

            {/* Student Life */}
            <div className="bg-[#865df6] bg-opacity-5 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Студенческая жизнь</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <BookOpen className="text-[#865df6] mr-3" size={20} />
                  <span>Читальный зал — обсуждаем интересные книги</span>
                </div>
                <div className="flex items-center">
                  <Users className="text-[#865df6] mr-3" size={20} />
                  <span>Киноклуб — обсуждаем фильмы</span>
                </div>
                <div className="flex items-center">
                  <Star className="text-[#865df6] mr-3" size={20} />
                  <span>Очные встречи в Москве, Сочи, Санкт-Петербурге</span>
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="flex justify-around mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#865df6] mb-1">4.9</div>
                <div className="text-sm text-gray-600">Яндекс отзывы</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#865df6] mb-1">4.7</div>
                <div className="text-sm text-gray-600">Отзовик</div>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="rounded-xl overflow-hidden mb-8 shadow-lg">
              <img
                src="https://files.salebot.pro/uploads/file_item/file/535162/Screenshot__24_.png"
                alt="Talentsy Additional Banner"
                className="w-full h-auto"
              />
            </div>

            {/* Keyword Block */}
            <div className="bg-[#865df6] bg-opacity-5 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-center">Ключевое слово</h3>
              <p className="text-center text-gray-600 mb-4">
                Ключевое слово из статьи: <span className="font-bold text-[#865df6]">Talentsy</span>
              </p>
              <p className="text-sm text-center text-gray-500">
                Введите это слово на вкладке "Задания", чтобы получить баллы
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}