import React from 'react';
import { Calendar, Users, UserPlus, CheckCircle, Send, BookOpen, Gift, UserPlus2 } from 'lucide-react';

interface DailyStats {
  date: string;
  totalVisitors: number;
  notRegistered: number;
  registered: number;
  quizCompleted: number;
  telegramSubscribed: number;
  keywordCompleted: number;
  prizeExchanges: number;
  referrals: number;
}

interface DailyStatsTableProps {
  stats: DailyStats[];
  loading: boolean;
}

export function DailyStatsTable({ stats, loading }: DailyStatsTableProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      name: 'Всего вошло в приложение',
      icon: Users,
      key: 'totalVisitors' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Не зарегистрировались',
      icon: UserPlus,
      key: 'notRegistered' as const,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'Зарегистрировались',
      icon: UserPlus2,
      key: 'registered' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Прошли тест',
      icon: CheckCircle,
      key: 'quizCompleted' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Подписались на Телеграм-канал',
      icon: Send,
      key: 'telegramSubscribed' as const,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },
    {
      name: 'Ввели ключевое слово',
      icon: BookOpen,
      key: 'keywordCompleted' as const,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      name: 'Обменяли баллы на призы',
      icon: Gift,
      key: 'prizeExchanges' as const,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      name: 'Пригласили рефералов',
      icon: Users,
      key: 'referrals' as const,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ] as const;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="text-[#865df6]" size={24} />
        <h3 className="text-lg font-semibold">Ежедневная статистика</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Показатель
                  </th>
                  {stats.map(stat => (
                    <th
                      key={stat.date}
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-900 whitespace-nowrap"
                    >
                      {new Date(stat.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metrics.map((metric) => (
                  <tr key={metric.key} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <div className={`${metric.bgColor} ${metric.color} p-1.5 rounded-lg`}>
                          <metric.icon size={16} />
                        </div>
                        <span>{metric.name}</span>
                      </div>
                    </td>
                    {stats.map(stat => (
                      <td
                        key={stat.date}
                        className={`whitespace-nowrap px-4 py-4 text-sm text-center font-medium ${
                          stat[metric.key] > 0 ? metric.color : 'text-gray-400'
                        }`}
                      >
                        {stat[metric.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}