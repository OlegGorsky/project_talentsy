import React, { useEffect, useState } from 'react';
import { User, Search, Trash2, Link } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string;
  referrer: {
    first_name: string;
    username?: string;
    avatar_url?: string;
  };
  referred: {
    first_name: string;
    username?: string;
    avatar_url?: string;
  };
}

export function ReferralsTab() {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referrer_id,
          referred_id,
          created_at,
          referrer:users!referrals_referrer_id_fkey(
            first_name,
            username,
            avatar_url
          ),
          referred:users!referrals_referred_id_fkey(
            first_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        return;
      }

      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();

    // Subscribe to changes in referrals and users tables
    const referralsChannel = supabase
      .channel('referrals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals'
        },
        () => {
          fetchReferrals();
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          fetchReferrals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(referralsChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);

  const handleDeleteReferral = async (referralId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту реферальную связь?')) return;

    try {
      const { error } = await supabase
        .from('referrals')
        .delete()
        .eq('id', referralId);

      if (error) throw error;
      setReferrals(referrals.filter(r => r.id !== referralId));
    } catch (error) {
      console.error('Error deleting referral:', error);
    }
  };

  const filteredReferrals = referrals.filter(referral =>
    referral.referrer?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    referral.referred?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    referral.referrer?.username?.toLowerCase().includes(search.toLowerCase()) ||
    referral.referred?.username?.toLowerCase().includes(search.toLowerCase()) ||
    referral.referrer_id.includes(search) ||
    referral.referred_id.includes(search)
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по рефералам..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6] focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Referrals List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Загрузка...</div>
      ) : (
        <div className="divide-y">
          {filteredReferrals.map(referral => (
            <div key={referral.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Referrer */}
                  <div className="flex items-center space-x-2">
                    {referral.referrer?.avatar_url ? (
                      <img
                        src={referral.referrer.avatar_url}
                        alt={referral.referrer.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">
                        {referral.referrer?.first_name || 'Пользователь удален'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {referral.referrer?.username 
                          ? `@${referral.referrer.username}` 
                          : referral.referrer_id}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <Link size={20} className="text-gray-400" />

                  {/* Referred */}
                  <div className="flex items-center space-x-2">
                    {referral.referred?.avatar_url ? (
                      <img
                        src={referral.referred.avatar_url}
                        alt={referral.referred.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">
                        {referral.referred?.first_name || 'Пользователь удален'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {referral.referred?.username 
                          ? `@${referral.referred.username}` 
                          : referral.referred_id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteReferral(referral.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredReferrals.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Рефералы не найдены
            </div>
          )}
        </div>
      )}
    </div>
  );
}