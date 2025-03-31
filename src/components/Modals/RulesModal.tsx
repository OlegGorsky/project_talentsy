import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export function RulesModal({ onClose }: RulesModalProps) {
  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]"
      onClick={(e) => {
        // Close modal when clicking overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl w-full max-w-md relative max-h-[80vh] flex flex-col">
        <div className="p-4 text-center border-b flex-shrink-0">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-semibold">Правила розыгрыша от Talentsy!</h3>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="space-y-2">
            {[
              'В розыгрыше могут принять участие все желающие, не важно учились вы в нашем онлайн-университете или нет.',
              'Выигрыш составляет 20.000 рублей и будет распределен среди пяти участников, собравших наибольшее количество баллов.',
              'Баллы начисляются за выполнение несложных заданий и приглашение друзей в это приложение розыгрыша.',
              'Свою ссылку для приглашения можно скопировать ниже в реферальном блоке или отправить ее сразу своим контактам в Телеграм.',
              'Кроме того, вы можете обменять накопленные баллы на полезные материалы от Talentsy на вкладке "Магазин".',
              'На вкладке "Рейтинг" вы можете узнать свой статус в турнирной таблице и посмотреть, кто сколько уже заработал баллов, чтоб оценить свои шансы на победу.',
              'В этом блоке на главной странице также видно количество накопленных баллов.',
              'также подписывайтесь на наши соцсети, если еще не подписаны - нажмите на плашку "Подпишись" в правом верхнем углу.'
            ].map((rule, index) => (
              <div key={index} className="flex items-start text-sm">
                <span className="text-[#865df6] font-medium mr-2 flex-shrink-0">{index + 1}.</span>
                <p className="text-gray-700">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t flex-shrink-0">
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