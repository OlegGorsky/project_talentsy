import React, { useEffect, useRef, useState } from 'react';
import { Phone, CheckCircle } from 'lucide-react';
import IMask from 'imask';
import { supabase } from '../../lib/supabase';

interface PhoneRegistrationProps {
  onComplete: () => void;
}

export function PhoneRegistration({ onComplete }: PhoneRegistrationProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inputRef.current) {
      const maskOptions = {
        mask: '+{7} (000) 000-00-00',
        lazy: false
      };
      
      const mask = IMask(inputRef.current, maskOptions);
      
      mask.on('accept', () => {
        setPhone(mask.value);
      });

      return () => {
        mask.destroy();
      };
    }
  }, []);

  useEffect(() => {
    const checkCompletion = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('phone_registration_points')
          .select('created_at')
          .eq('user_id', tg.initDataUnsafe.user.id)
          .maybeSingle();

        if (error) throw error;
        setCompleted(!!data);
      } catch (error) {
        console.error('Error checking completion:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCompletion();
  }, []);

  const handleSubmit = async () => {
    if (phone.replace(/\D/g, '').length !== 11 || isSubmitting) return;

    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user?.id) return;

    setIsSubmitting(true);
    try {
      // Update phone number
      const { error: updateError } = await supabase
        .from('users')
        .update({ phone_number: phone })
        .eq('telegram_id', tg.initDataUnsafe.user.id);

      if (updateError) throw updateError;

      // Record points
      const { error: pointsError } = await supabase
        .from('phone_registration_points')
        .insert([{ user_id: tg.initDataUnsafe.user.id }]);

      if (!pointsError || pointsError.code === '23505') {
        // Add points only if this is the first registration
        if (!pointsError) {
          await supabase.rpc('add_referral_points', {
            user_id: tg.initDataUnsafe.user.id,
            points_to_add: 100
          });
        }
        
        setCompleted(true);
        onComplete();
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-[#865df6] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Phone className="text-[#865df6]" size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="text-base font-medium">Оставьте свой номер телефона</h3>
          <p className="text-sm text-gray-500 mb-4">Получите 100 баллов за регистрацию номера</p>
          
          {!completed ? (
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="tel"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6] focus:border-transparent text-center"
                placeholder="+7 (___) ___-__-__"
                disabled={isSubmitting}
              />
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || phone.replace(/\D/g, '').length !== 11}
                className={`w-full bg-[#865df6] text-white py-2.5 rounded-lg font-medium transition-colors ${
                  isSubmitting || phone.replace(/\D/g, '').length !== 11
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#7147f5]'
                }`}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить номер'}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
              <CheckCircle className="mx-auto mb-2" size={24} />
              <p className="font-medium">Номер сохранен!</p>
              <p className="text-sm">Вы получили 100 баллов</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}