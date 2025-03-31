import React, { useState, useEffect } from 'react';
import { Users, Link2, BarChart } from 'lucide-react';
import { UsersTab } from './UsersTab';
import { ReferralsTab } from './ReferralsTab';
import { AnalyticsTab } from './AnalyticsTab';

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'referrals' | 'analytics'>('analytics');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Панель администратора</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'users'
                ? 'text-[#865df6] border-b-2 border-[#865df6]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Пользователи</span>
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'referrals'
                ? 'text-[#865df6] border-b-2 border-[#865df6]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('referrals')}
          >
            <Link2 size={18} />
            <span>Рефералы</span>
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === 'analytics'
                ? 'text-[#865df6] border-b-2 border-[#865df6]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart size={18} />
            <span>Аналитика</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'referrals' && <ReferralsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}