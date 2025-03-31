import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance: initialBalance }: BalanceCardProps) {
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserPoints = async () => {
      const tg = window.Telegram.WebApp;
      if (!tg.initDataUnsafe.user?.id) return;

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('points')
          .eq('telegram_id', tg.initDataUnsafe.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user points:', error);
          return;
        }

        setPoints(userData?.points ?? 0);
      } catch (error) {
        console.error('Error fetching user points:', error);
        setPoints(0);
      }
    };

    fetchUserPoints();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('users_points_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `telegram_id=eq.${window.Telegram.WebApp.initDataUnsafe.user?.id}`,
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
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <img 
        src="https://files.salebot.pro/uploads/file_item/file/535162/image-removebg-preview__67___1__1.png" 
        alt="Coins"
        className="w-6 h-6 object-contain"
        draggable="false"
      />
      <p className="font-manrope text-xl font-bold text-gray-900">
        {points === null ? '—' : points.toLocaleString()}
      </p>
    </div>
  );
}