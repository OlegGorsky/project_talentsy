import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

export function useDailyStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DailyStats[]>([]);

  const fetchDailyStats = async () => {
    try {
      setLoading(true);
      
      // Generate dates from Feb 23 to Mar 20
      const dates = [];
      const startDate = new Date('2024-02-23');
      const endDate = new Date('2024-03-20');
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const date = new Date(d).toISOString().split('T')[0];
        const nextDate = new Date(new Date(d).setDate(d.getDate() + 1)).toISOString().split('T')[0];

        // Get all stats for this date in parallel
        const [
          { data: visitorsCount },
          { data: registeredCount },
          { data: quizCount },
          { data: telegramCount },
          { data: keywordCount },
          { data: prizesCount },
          { data: referralsCount }
        ] = await Promise.all([
          // Total visitors
          supabase.rpc('count_daily_visitors', { 
            start_date: date,
            end_date: nextDate
          }),
          
          // Registered users
          supabase.rpc('count_daily_registrations', {
            start_date: date,
            end_date: nextDate
          }),
          
          // Quiz completions
          supabase.rpc('count_daily_quiz_completions', {
            start_date: date,
            end_date: nextDate
          }),
          
          // Telegram subscriptions
          supabase.rpc('count_daily_telegram_subs', {
            start_date: date,
            end_date: nextDate
          }),
          
          // Keyword completions
          supabase.rpc('count_daily_keyword_completions', {
            start_date: date,
            end_date: nextDate
          }),
          
          // Prize exchanges
          supabase.rpc('count_daily_prize_exchanges', {
            start_date: date,
            end_date: nextDate
          }),
          
          // Referrals
          supabase.rpc('count_daily_referrals', {
            start_date: date,
            end_date: nextDate
          })
        ]);

        const totalVisitors = visitorsCount || 0;
        const registered = registeredCount || 0;
        const quizCompleted = quizCount || 0;
        const telegramSubscribed = telegramCount || 0;
        const keywordCompleted = keywordCount || 0;
        const prizeExchanges = prizesCount || 0;
        const referrals = referralsCount || 0;

        dates.push({
          date,
          totalVisitors,
          registered,
          notRegistered: totalVisitors - registered,
          quizCompleted,
          telegramSubscribed,
          keywordCompleted,
          prizeExchanges,
          referrals
        });
      }

      setStats(dates);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStats();

    // Set up real-time subscriptions for all relevant tables
    const channels = [
      'users',
      'quiz_completions',
      'telegram_subscriptions',
      'prize_exchanges',
      'referrals',
      'phone_registration_points'
    ].map(table => 
      supabase.channel(`daily_stats_${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            console.log(`Changes detected in ${table}, refreshing stats...`);
            fetchDailyStats();
          }
        )
        .subscribe()
    );

    // Refresh stats every minute
    const interval = setInterval(fetchDailyStats, 60000);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      clearInterval(interval);
    };
  }, []);

  return { stats, loading, refetch: fetchDailyStats };
}