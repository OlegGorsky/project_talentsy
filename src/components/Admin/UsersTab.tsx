import React, { useEffect, useState } from 'react';
import { User, Search, Trash2, Plus, Gift, BookOpen, Users, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TaskManagementModal } from './TaskManagementModal';
import { PrizeManagementModal } from './PrizeManagementModal';

interface UserData {
  id: string;
  telegram_id: string;
  first_name: string;
  username?: string;
  avatar_url: string | null;
  phone_number?: string;
  points: number;
  created_at: string;
  last_login: string;
  onboarding_completed: boolean;
  keyword_completed: boolean;
  telegram_subscribed: boolean;
  quiz_completed: boolean;
  referral_count: number;
  start_data: any;
  prize_exchanges: Array<{
    id: string;
    prize_name: string;
    points_spent: number;
    created_at: string;
  }>;
}

interface DeleteConfirmationModalProps {
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

type SortField = 'first_name' | 'telegram_id' | 'phone_number' | 'points' | 'tasks' | 'referral_count' | 'prize_count' | 'created_at';
type SortDirection = 'asc' | 'desc';

function DeleteConfirmationModal({ selectedCount, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Подтверждение удаления</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Вы уверены, что хотите удалить {selectedCount} {selectedCount === 1 ? 'пользователя' : 'пользователей'}?
          Это действие нельзя отменить.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

interface NewUser {
  telegram_id: string;
  first_name: string;
  username?: string;
  phone_number?: string;
  points: number;
}

interface SortButtonProps {
  field: SortField;
  currentField: SortField | null;
  direction: SortDirection;
  onClick: () => void;
  label: string;
}

function SortButton({ field, currentField, direction, onClick, label }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1 group"
    >
      <span>{label}</span>
      <span className="text-gray-400 group-hover:text-gray-600">
        {field === currentField ? (
          direction === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        ) : (
          <ArrowUpDown size={16} />
        )}
      </span>
    </button>
  );
}

export function UsersTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editPoints, setEditPoints] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserForTasks, setSelectedUserForTasks] = useState<UserData | null>(null);
  const [selectedUserForPrizes, setSelectedUserForPrizes] = useState<UserData | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [newUser, setNewUser] = useState<NewUser>({
    telegram_id: '',
    first_name: '',
    username: '',
    phone_number: '',
    points: 0
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with all related data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Get additional data for each user
      const enhancedUsers = await Promise.all((usersData || []).map(async (user) => {
        // Get telegram subscription status
        const { data: subscriptionData } = await supabase
          .from('telegram_subscriptions')
          .select('subscribed_at')
          .eq('user_id', user.telegram_id)
          .maybeSingle();

        // Get quiz completion status
        const { data: quizData } = await supabase
          .from('quiz_completions')
          .select('completed_at')
          .eq('user_id', user.telegram_id)
          .maybeSingle();

        // Get referral count
        const { count: referralCount } = await supabase
          .from('referrals')
          .select('*', { count: 'exact' })
          .eq('referrer_id', user.telegram_id);

        // Get prize exchanges
        const { data: prizeExchanges } = await supabase
          .from('prize_exchanges')
          .select('id, prize_name, points_spent, created_at')
          .eq('user_id', user.telegram_id)
          .order('created_at', { ascending: false });

        return {
          ...user,
          telegram_subscribed: !!subscriptionData,
          quiz_completed: !!quizData,
          referral_count: referralCount || 0,
          prize_exchanges: prizeExchanges || []
        };
      }));

      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up real-time subscription
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

  const handleUpdatePoints = async (user: UserData) => {
    try {
      const newPoints = parseInt(editPoints);
      if (isNaN(newPoints)) return;

      const { error } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('telegram_id', user.telegram_id);

      if (error) throw error;

      setUsers(users.map(u => 
        u.telegram_id === user.telegram_id ? { ...u, points: newPoints } : u
      ));
      setEditingUser(null);
      setEditPoints('');
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  const handleDeleteUser = async (user: UserData) => {
    if (isDeleting) return;
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    setIsDeleting(true);
    try {
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('telegram_id', user.telegram_id);

      if (userError) throw userError;

      setUsers(users.filter(u => u.telegram_id !== user.telegram_id));
    } catch (error) {
      console.error('Error during deletion:', error);
      alert('Ошибка при удалении пользователя');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddUser = async () => {
    try {
      if (!newUser.telegram_id || !newUser.first_name) {
        alert('Заполните обязательные поля');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;

      setUsers([data, ...users]);
      setShowAddUser(false);
      setNewUser({
        telegram_id: '',
        first_name: '',
        username: '',
        phone_number: '',
        points: 0
      });
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Ошибка при добавлении пользователя');
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.telegram_id)));
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('telegram_id', Array.from(selectedUsers));

      if (error) throw error;

      setUsers(users.filter(user => !selectedUsers.has(user.telegram_id)));
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Error during bulk deletion:', error);
      alert('Ошибка при удалении пользователей');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortUsers = (users: UserData[]) => {
    if (!sortField) return users;

    return [...users].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'first_name':
          comparison = a.first_name.localeCompare(b.first_name);
          break;
        case 'telegram_id':
          comparison = a.telegram_id.localeCompare(b.telegram_id);
          break;
        case 'phone_number':
          comparison = (a.phone_number || '').localeCompare(b.phone_number || '');
          break;
        case 'points':
          comparison = a.points - b.points;
          break;
        case 'tasks':
          const tasksA = Number(a.quiz_completed) + Number(a.keyword_completed) + Number(a.telegram_subscribed);
          const tasksB = Number(b.quiz_completed) + Number(b.keyword_completed) + Number(b.telegram_subscribed);
          comparison = tasksA - tasksB;
          break;
        case 'referral_count':
          comparison = a.referral_count - b.referral_count;
          break;
        case 'prize_count':
          comparison = a.prize_exchanges.length - b.prize_exchanges.length;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.telegram_id.includes(search) ||
    user.phone_number?.includes(search)
  );

  const sortedUsers = sortUsers(filteredUsers);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-[#865df6] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#7147f5] transition-colors"
          >
            <Plus size={20} />
            <span>Добавить пользователя</span>
          </button>
          
          {selectedUsers.size > 0 && (
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
            >
              <Trash2 size={20} />
              <span>Удалить выбранных ({selectedUsers.size})</span>
            </button>
          )}
        </div>
        
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск пользователей..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6] focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Загрузка...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#865df6] focus:ring-[#865df6]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="first_name"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('first_name')}
                    label="Пользователь"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="telegram_id"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('telegram_id')}
                    label="Telegram ID"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="phone_number"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('phone_number')}
                    label="Телефон"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="points"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('points')}
                    label="Баллы"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="tasks"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('tasks')}
                    label="Задания"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="referral_count"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('referral_count')}
                    label="Рефералы"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="prize_count"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('prize_count')}
                    label="Призы"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Метка</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <SortButton
                    field="created_at"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={() => handleSort('created_at')}
                    label="Регистрация"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.telegram_id)}
                      onChange={() => handleUserSelect(user.telegram_id)}
                      className="rounded border-gray-300 text-[#865df6] focus:ring-[#865df6]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.first_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="font-medium">{user.first_name}</div>
                        <div className="text-sm text-gray-500">
                          {user.username ? `@${user.username}` : 'Нет username'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.telegram_id}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.phone_number || 'Не указан'}
                  </td>
                  <td className="px-4 py-3">
                    {editingUser?.id === user.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          className="w-24 px-2 py-1 border rounded"
                          value={editPoints}
                          onChange={(e) => setEditPoints(e.target.value)}
                        />
                        <button
                          onClick={() => handleUpdatePoints(user)}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <User size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setEditPoints('');
                          }}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{user.points.toLocaleString()}</span>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setEditPoints(user.points.toString());
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <User size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUserForTasks(user)}
                        className="flex items-center space-x-2 text-[#865df6] hover:text-[#7147f5]"
                      >
                        <BookOpen size={16} />
                        <span className="text-sm">Управлять</span>
                      </button>
                      <div className="flex -space-x-1">
                        {user.quiz_completed && (
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-700 border-2 border-white" title="Опрос пройден">
                            1
                          </div>
                        )}
                        {user.keyword_completed && (
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 border-2 border-white" title="Ключевое слово введено">
                            2
                          </div>
                        )}
                        {user.telegram_subscribed && (
                          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-xs text-purple-700 border-2 border-white" title="Подписка на канал">
                            3
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm">
                      <Users size={14} className="text-[#865df6] mr-1" />
                      <span>{user.referral_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedUserForPrizes(user)}
                      className="flex items-center space-x-2 text-[#865df6] hover:text-[#7147f5]"
                    >
                      <Gift size={16} />
                      <span className="text-sm">Управлять</span>
                      {user.prize_exchanges.length > 0 && (
                        <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs text-yellow-700 border-2 border-white">
                          {user.prize_exchanges.length}
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.start_data ? (
                      <div className="max-w-xs truncate" title={JSON.stringify(user.start_data, null, 2)}>
                        {JSON.stringify(user.start_data)}
                      </div>
                    ) : (
                      <span className="text-gray-400">Нет метки</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className={`p-1 text-gray-400 hover:text-red-600 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isDeleting}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Пользователи не найдены
            </div>
          )}
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Добавить пользователя</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telegram ID *
                </label>
                <input
                  type="text"
                  value={newUser.telegram_id}
                  onChange={(e) => setNewUser({ ...newUser, telegram_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6]"
                  placeholder="Например: 123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6]"
                  placeholder="Имя пользователя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6]"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={newUser.phone_number}
                  onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6]"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Баллы
                </label>
                <input
                  type="number"
                  value={newUser.points}
                  onChange={(e) => setNewUser({ ...newUser, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6]"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleAddUser}
                className="bg-[#865df6] text-white px-4 py-2 rounded-lg hover:bg-[#7147f5] transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          selectedCount={selectedUsers.size}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}

      {selectedUserForTasks && (
        <TaskManagementModal
          user={selectedUserForTasks}
          onClose={() => setSelectedUserForTasks(null)}
          onRefresh={fetchUsers}
        />
      )}

      {selectedUserForPrizes && (
        <PrizeManagementModal
          user={selectedUserForPrizes}
          onClose={() => setSelectedUserForPrizes(null)}
          onRefresh={fetchUsers}
        /> )}
    </div>
  );
}