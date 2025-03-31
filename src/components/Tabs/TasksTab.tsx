import React from 'react';
import { CheckCircle } from 'lucide-react';
import { KeywordTask } from '../Tasks/KeywordTask';
import { TelegramSubscriptionTask } from '../Tasks/TelegramSubscriptionTask';

interface TasksTabProps {
  onShowArticle: () => void;
}

export function TasksTab({ onShowArticle }: TasksTabProps) {
  return (
    <div className="p-4">
      <div className="bg-[#865df6] text-white p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-3">
          <CheckCircle size={24} />
          <div>
            <h2 className="text-lg font-semibold">Задания</h2>
            <p className="text-sm opacity-90">Выполняйте задания и получайте баллы</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Telegram Subscription Task */}
        <TelegramSubscriptionTask channelUsername="talentsy_official" />
        
        {/* Article Reading Task */}
        <KeywordTask onShowArticle={onShowArticle} />
      </div>
    </div>
  );
}