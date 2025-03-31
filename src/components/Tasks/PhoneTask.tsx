import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import IMask from 'imask';
import { supabase } from '../../lib/supabase';

export function PhoneTask() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const maskRef = useRef<IMask.InputMask<IMask.AnyMaskedOptions> | null>(null);

  useEffect(() => {
    const initializeMask = () => {
      if (!inputRef.current) return;

      // Destroy existing mask if it exists
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }

      // Create new mask with strict validation
      const mask = IMask(inputRef.current, {
        mask: '+{7} (000) 000-00-00',
        lazy: false,
        placeholderChar: '_',
        definitions: {
          '0': {
            mask: /[0-9]/
          }
        },
        prepare: (str: string) => {
          // Only allow digits and special characters
          return str.replace(/[^\d\s()\-+]/g, '');
        }
      });

      // Store mask reference
      maskRef.current = mask;

      // Set initial value to +7 if empty
      if (!mask.value) {
        mask.value = '+7';
        setPhone(mask.value);
      }

      // Handle value changes
      mask.on('accept', () => {
        setPhone(mask.value);
        
        // Ensure cursor is positioned correctly after +7
        if (mask.value === '+7' && inputRef.current) {
          inputRef.current.setSelectionRange(2, 2);
        }
      });

      // Handle input events
      inputRef.current.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        const value = input.value;

        // Ensure +7 is always present
        if (!value.startsWith('+7')) {
          mask.value = '+7' + value.replace(/[^\d]/g, '');
        }
      });

      // Prevent non-numeric input
      inputRef.current.addEventListener('keypress', (e) => {
        const key = e.key;
        if (!/[\d]/.test(key)) {
          e.preventDefault();
        }
      });

      // Prevent cursor from moving before +7
      inputRef.current.addEventListener('keydown', (e) => {
        const input = e.target as HTMLInputElement;
        const selectionStart = input.selectionStart || 0;

        if (selectionStart < 2 && e.key !== 'ArrowRight' && e.key !== 'ArrowDown') {
          e.preventDefault();
          input.setSelectionRange(2, 2);
        }
      });

      // Focus input and position cursor after +7
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(2, 2);
        }
      });
    };

    initializeMask();

    return () => {
      if (maskRef.current) {
        maskRef.current.destroy();
        maskRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkCompletion = async () => {
      const tg = window.Telegram?.WebApp;
      if (!tg?.initDataUnsafe?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Check both phone registration points and user's phone number
        const [{ data: pointsData }, { data: userData }] = await Promise.all([
          supabase
            .from('phone_registration_points')
            .select('created_at')
            .eq('user_id', tg.initDataUnsafe.user.id)
            .maybeSingle(),
          supabase
            .from('users')
            .select('phone_number')
            .eq('telegram_id', tg.initDataUnsafe.user.id)
            .single()
        ]);

        setCompleted(!!pointsData || !!userData?.phone_number);
        
        // If user already has a phone number, set it in the input
        if (userData?.phone_number && maskRef.current) {
          maskRef.current.value = userData.phone_number;
          setPhone(userData.phone_number);
        }
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
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = () => {
    // When input is focused, ensure cursor is positioned correctly
    if (inputRef.current) {
      const value = inputRef.current.value;
      if (!value || value === '+7') {
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(2, 2);
        });
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const selectionStart = input.selectionStart || 0;

    // Prevent cursor from moving before +7
    if (selectionStart < 2) {
      requestAnimationFrame(() => {
        input.setSelectionRange(2, 2);
      });
    }
  };

  // Prevent paste of non-numeric characters
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericOnly = pastedText.replace(/\D/g, '');
    
    if (maskRef.current && numericOnly) {
      const currentValue = maskRef.current.value;
      const newValue = currentValue.slice(0, 2) + numericOnly;
      maskRef.current.value = newValue;
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>;
  }

  return (
    <div className="space-y-4">
      {!completed ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6] focus:border-transparent text-center text-lg"
              placeholder="+7 (___) ___-__-__"
              disabled={isSubmitting}
              onFocus={handleFocus}
              onClick={handleClick}
              onPaste={handlePaste}
            />
          </div>
          
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
  );
}