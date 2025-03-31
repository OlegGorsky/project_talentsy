import React from 'react';
import { Trophy, CheckCircle } from 'lucide-react';

interface Prize {
  id: number;
  name: string;
  points: number;
  description: string;
  botUrl: string;
}

interface PrizesTabProps {
  prizes: Prize[];
  onPrizeSelect: (prize: Prize) => void;
}

export function PrizesTab({ prizes, onPrizeSelect }: PrizesTabProps) {
  return (
    <div className="p-4">
      {/* Prize Fund */}
      <div className="bg-[#865df6] text-white p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <Trophy size={24} />
          <div>
            <h2 className="text-lg font-semibold">Призовой фонд</h2>
            <p className="text-sm opacity-90">20 000 рублей</p>
          </div>
        </div>
        <p className="text-sm opacity-90">
          Призовой фонд будет распределен между пятью участниками, набравшими наибольшее количество баллов
        </p>
      </div>

      {/* Prize Places */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Призовые места:</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy size={20} className="text-[#FFD700] mr-2" />
              <span className="font-medium text-gray-900">1 место</span>
            </div>
            <span className="font-bold text-[#865df6]">8 000 ₽</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy size={20} className="text-[#C0C0C0] mr-2" />
              <span className="font-medium text-gray-900">2 место</span>
            </div>
            <span className="font-bold text-[#865df6]">5 000 ₽</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy size={20} className="text-[#CD7F32] mr-2" />
              <span className="font-medium text-gray-900">3 место</span>
            </div>
            <span className="font-bold text-[#865df6]">3 000 ₽</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy size={20} className="text-[#9C27B0] mr-2" />
              <span className="font-medium text-gray-900">4 место</span>
            </div>
            <span className="font-bold text-[#865df6]">2 000 ₽</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy size={20} className="text-[#2196F3] mr-2" />
              <span className="font-medium text-gray-900">5 место</span>
            </div>
            <span className="font-bold text-[#865df6]">2 000 ₽</span>
          </div>
        </div>
      </div>

      {/* Contest Rules */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Правила розыгрыша:</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <CheckCircle className="text-[#865df6] mt-1 mr-3 flex-shrink-0" size={18} />
            <p className="text-gray-900">В розыгрыше могут принять участие все желающие, не важно учились вы в нашем онлайн-университете или нет.</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="text-[#865df6] mt-1 mr-3 flex-shrink-0" size={18} />
            <p className="text-gray-900">Выигрыш составляет 20.000 рублей и будет распределен среди пяти участников, собравших наибольшее количество баллов.</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="text-[#865df6] mt-1 mr-3 flex-shrink-0" size={18} />
            <p className="text-gray-900">Баллы начисляются за выполнение несложных заданий и приглашение друзей в это приложение розыгрыша.</p>
          </div>
          <div className="flex items-start">
            <CheckCircle className="text-[#865df6] mt-1 mr-3 flex-shrink-0" size={18} />
            <p className="text-gray-900">Кроме того, вы можете обменять накопленные баллы на полезные материалы от Talentsy на вкладке "Магазин".</p>
          </div>
        </div>
      </div>
    </div>
  );
}