import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePoints() {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('points')
          .eq('telegram_id', tg.initDataUnsafe.user.id)
          .single();

        if (error) throw error;
        setPoints(data.points || 0);
      } catch (error) {
        console.error('Error fetching points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();

    // Subscribe to points changes
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      const channel = supabase
        .channel('user_points')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `telegram_id=eq.${tg.initDataUnsafe.user.id}`,
          },
          (payload: any) => {
            if (payload.new.points !== undefined) {
              setPoints(payload.new.points);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return { points, setPoints, loading };
}