import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface ReferralRulesModalProps {
  onClose: () => void;
}

export function ReferralRulesModal({ onClose }: ReferralRulesModalProps) {
  const rules = [
    'За каждого приглашенного начисляется 100 баллов.',
    'Пригласить одного человека можно только один раз.',
    'Приглашение чужих рефералов не засчитывается.',
    'Приглашение себя также не засчитывается.',
    'Баллы за приглашенного начисляются только после прохождения им анкеты с вопросами.',
    'Массовые действия с приглашением ботов проверяются системой и не засчитываются.'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Правила приглашения</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Rules List */}
        <div className="p-4">
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="text-[#865df6] mt-0.5 mr-3 flex-shrink-0" size={18} />
                <p className="text-gray-700">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-[#865df6] text-white py-2.5 rounded-lg font-medium hover:bg-[#7147f5] transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}