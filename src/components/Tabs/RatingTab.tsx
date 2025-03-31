import React, { useEffect, useState } from 'react';
import { Trophy, User, Coins } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserData {
  id: string;
  telegram_id: string;
  first_name: string;
  avatar_url: string | null;
  points: number;
}

export function RatingTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const tg = window.Telegram?.WebApp;
        const currentUserId = tg?.initDataUnsafe?.user?.id;

        // Get total number of users and current user's rank
        if (currentUserId) {
          const { count: totalCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

          // Get users with more points than current user to determine rank
          const { data: currentUser } = await supabase
            .from('users')
            .select('points')
            .eq('telegram_id', currentUserId)
            .single();

          if (currentUser) {
            const { count: usersAbove } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .gt('points', currentUser.points);

            setUserPoints(currentUser.points);
            setUserRank((usersAbove || 0) + 1);
            setTotalUsers(totalCount || 0);
          }
        }

        // Get top 50 users for the list
        const { data: topUsers } = await supabase
          .from('users')
          .select('*')
          .order('points', { ascending: false })
          .limit(50);

        setUsers(topUsers || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Subscribe to changes
    const channel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      case 3: return '#9C27B0'; // Purple
      case 4: return '#2196F3'; // Blue
      default: return 'transparent';
    }
  };

  const renderUserRow = (user: UserData, index: number) => (
    <div key={user.id} className="flex items-center py-3">
      <div className="w-8 text-center font-medium text-gray-900">
        {index + 1}
      </div>
      <div className="flex items-center flex-1 min-w-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.first_name}
            className="w-8 h-8 rounded-full object-cover ml-2"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-2">
            <User size={16} className="text-gray-400" />
          </div>
        )}
        <span className="ml-3 font-medium text-gray-900 truncate">
          {user.first_name}
        </span>
      </div>
      <div className="flex items-center">
        <span className="font-medium text-[#865df6] mr-2">
          {user.points.toLocaleString()}
        </span>
        {index < 5 && (
          <Trophy 
            className="flex-shrink-0" 
            size={18} 
            style={{ color: getMedalColor(index) }}
          />
        )}
      </div>
    </div>
  );

  const renderSkeletonRow = (index: number) => (
    <div key={index} className="flex items-center py-3">
      <div className="w-8 text-center">
        <div className="h-4 w-4 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
      </div>
      <div className="flex items-center flex-1 min-w-0 ml-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="ml-3 h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="flex items-center">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mr-2"></div>
        {index < 5 && (
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pb-[120px]">
      <div className="p-4">
        <div className="bg-[#865df6] text-white p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-3">
            <Trophy size={24} />
            <div>
              <h2 className="text-lg font-semibold">Рейтинг участников</h2>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => renderSkeletonRow(index))
          ) : users.length > 0 ? (
            users.map((user, index) => renderUserRow(user, index))
          ) : (
            <div className="text-center py-8 text-gray-900">
              Пока нет участников в рейтинге
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom panel */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Trophy size={20} className="text-[#865df6] mr-2" />
            <span className="text-gray-900">
              Твое место: <span className="font-bold">{userRank || '-'}</span>
            </span>
          </div>
          <div className="flex items-center">
            <Coins size={20} className="text-[#865df6] mr-2" />
            <span className="text-gray-900">
              Баллы: <span className="font-bold">{userPoints.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}