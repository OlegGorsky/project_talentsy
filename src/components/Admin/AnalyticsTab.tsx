import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Gift, CheckCircle, Calendar, ChevronDown, Link } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DailyStatsTable } from './DailyStatsTable';
import { useDailyStats } from '../../hooks/useDailyStats';

interface TaskStats {
  totalVisitors: number;
  registeredUsers: number;
  quizCompleted: number;
  keywordCompleted: number;
  telegramSubscribed: number;
  prizeExchanges: number;
  referrals: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface SourceStats {
  source: string;
  count: number;
}

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    totalVisitors: 0,
    registeredUsers: 0,
    quizCompleted: 0,
    keywordCompleted: 0,
    telegramSubscribed: 0,
    prizeExchanges: 0,
    referrals: 0
  });
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { stats: dailyStats, loading: dailyStatsLoading } = useDailyStats();

  const handleAllTimeClick = () => {
    setDateRange({
      start: '2024-01-01', // Start of the project
      end: new Date().toISOString().split('T')[0]
    });
    setShowDatePicker(false);
  };

  const decodeStartData = (startData: any): string => {
    if (!startData) return 'Нет метки';
    
    try {
      if (typeof startData === 'string') {
        try {
          const parsed = JSON.parse(startData);
          if (parsed.source) {
            return parsed.source;
          }
        } catch {
          return startData;
        }
      }
      
      if (typeof startData === 'object' && startData.source) {
        return startData.source;
      }
      
      return JSON.stringify(startData);
    } catch (error) {
      console.error('Error decoding start data:', error);
      return 'Ошибка декодирования';
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [
        { data: usersData },
        { data: quizData },
        { data: telegramData },
        { data: keywordData },
        { data: prizesData },
        { data: referralsData },
        { data: sourcesData }
      ] = await Promise.all([
        // Get total visitors
        supabase
          .from('users')
          .select('*')
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end + ' 23:59:59'),
        
        // Get quiz completions
        supabase
          .from('quiz_completions')
          .select('*')
          .gte('completed_at', dateRange.start)
          .lte('completed_at', dateRange.end + ' 23:59:59'),
        
        // Get telegram subscriptions
        supabase
          .from('telegram_subscriptions')
          .select('*')
          .gte('subscribed_at', dateRange.start)
          .lte('subscribed_at', dateRange.end + ' 23:59:59'),
        
        // Get keyword completions
        supabase
          .from('users')
          .select('*')
          .eq('keyword_completed', true)
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end + ' 23:59:59'),
        
        // Get prize exchanges
        supabase
          .from('prize_exchanges')
          .select('*')
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end + ' 23:59:59'),
        
        // Get referrals
        supabase
          .from('referrals')
          .select('*')
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end + ' 23:59:59'),
        
        // Get source stats
        supabase
          .from('users')
          .select('start_data')
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end + ' 23:59:59')
      ]);

      // Process source stats
      const sourceCounts: { [key: string]: number } = {};
      sourcesData?.forEach(user => {
        const source = decodeStartData(user.start_data);
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      const sourceStatsArray = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      setSourceStats(sourceStatsArray);
      setTaskStats({
        totalVisitors: usersData?.length || 0,
        registeredUsers: 0, // Will be updated with phone registrations
        quizCompleted: quizData?.length || 0,
        keywordCompleted: keywordData?.length || 0,
        telegramSubscribed: telegramData?.length || 0,
        prizeExchanges: prizesData?.length || 0,
        referrals: referralsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription
    const channels = [
      'users',
      'quiz_completions',
      'telegram_subscriptions',
      'prize_exchanges',
      'referrals',
      'phone_registration_points'
    ].map(table => 
      supabase
        .channel(`analytics_${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            console.log(`Changes detected in ${table}, refreshing stats...`);
            fetchStats();
          }
        )
        .subscribe()
    );

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      clearInterval(interval);
    };
  }, [dateRange]);

  const completedTasks = Object.values(taskStats).filter(value => 
    typeof value === 'boolean' && value
  ).length;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="text-[#865df6] mr-2" size={24} />
            Период анализа
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span>
                {dateRange.start === '2024-01-01' ? 'За все время' : `${dateRange.start} — ${dateRange.end}`}
              </span>
              <ChevronDown size={16} />
            </button>
            
            {showDatePicker && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10 border">
                <div className="space-y-4">
                  <button
                    onClick={handleAllTimeClick}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    За все время
                  </button>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Начало периода
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Конец периода
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      fetchStats();
                      setShowDatePicker(false);
                    }}
                    className="w-full bg-[#865df6] text-white py-2 rounded-lg hover:bg-[#7147f5] transition-colors"
                  >
                    Применить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Stats Table */}
      <DailyStatsTable stats={dailyStats} loading={dailyStatsLoading} />

      {/* Source Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Link className="text-[#865df6]" size={24} />
          <h3 className="text-lg font-semibold">Статистика по меткам</h3>
        </div>
        <div className="space-y-4">
          {sourceStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {stat.source}
                  </span>
                  <span className="text-sm font-medium text-[#865df6]">{stat.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#865df6] h-2 rounded-full"
                    style={{
                      width: `${(stat.count / taskStats.totalVisitors * 100) || 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {sourceStats.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              Нет данных по меткам
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.totalVisitors}</p>
            </div>
            <div className="w-12 h-12 bg-[#865df6] bg-opacity-10 rounded-full flex items-center justify-center">
              <Users className="text-[#865df6]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего рефералов</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.referrals}</p>
            </div>
            <div className="w-12 h-12 bg-[#865df6] bg-opacity-10 rounded-full flex items-center justify-center">
              <UserPlus className="text-[#865df6]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Выполнено заданий</p>
              <p className="text-2xl font-bold text-gray-900">
                {taskStats.quizCompleted + taskStats.keywordCompleted + taskStats.telegramSubscribed}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#865df6] bg-opacity-10 rounded-full flex items-center justify-center">
              <CheckCircle className="text-[#865df6]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Обменено призов</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.prizeExchanges}</p>
            </div>
            <div className="w-12 h-12 bg-[#865df6] bg-opacity-10 rounded-full flex items-center justify-center">
              <Gift className="text-[#865df6]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Task Completion Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Статистика по заданиям</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Пользователи</h4>
              <Users className="text-[#865df6]" size={20} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Всего зашло в приложение:</span>
                  <span className="font-medium">{taskStats.totalVisitors}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#865df6] h-2 rounded-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Зарегистрировались:</span>
                  <span className="font-medium">{taskStats.registeredUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#865df6] h-2 rounded-full" 
                    style={{ 
                      width: `${taskStats.totalVisitors > 0 ? (taskStats.registeredUsers / taskStats.totalVisitors * 100) : 0}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quiz and Article Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Выполнение заданий</h4>
              <CheckCircle className="text-[#865df6]" size={20} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Прошли тест:</span>
                  <span className="font-medium">{taskStats.quizCompleted}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#865df6] h-2 rounded-full" 
                    style={{ 
                      width: `${taskStats.totalVisitors > 0 ? (taskStats.quizCompleted / taskStats.totalVisitors * 100) : 0}%` 
                    }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Ввели ключевое слово:</span>
                  <span className="font-medium">{taskStats.keywordCompleted}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#865df6] h-2 rounded-full" 
                    style={{ 
                      width: `${taskStats.totalVisitors > 0 ? (taskStats.keywordCompleted / taskStats.totalVisitors * 100) : 0}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Tasks Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Дополнительные действия</h4>
              <Gift className="text-[#865df6]" size={20} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Подписались на канал:</span>
                  <span className="font-medium">{taskStats.telegramSubscribed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#865df6] h-2 rounded-full" 
                    style={{ 
                      width: `${taskStats.totalVisitors > 0 ? (taskStats.telegramSubscribed / taskStats.totalVisitors * 100) : 0}%` 
                    }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Обменяли призы:</span>
                  <span className="font-medium">{taskStats.prizeExchanges}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#865df6] h-2 rounded-full" 
                    style={{ 
                      width: `${taskStats.totalVisitors > 0 ? (taskStats.prizeExchanges / taskStats.totalVisitors * 100) : 0}%` 
                    }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Пригласили рефералов:</span>
                  <span className="font-medium">{taskStats.referrals}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#865df6] h-2 rounded-full" 
                    style={{ 
                      width: `${taskStats.totalVisitors > 0 ? (taskStats.referrals / taskStats.totalVisitors * 100) : 0}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}