import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Onboarding } from '../Onboarding/Onboarding';

interface SplashProps {
  onComplete: () => void;
}

interface ReferralData {
  referrer_id: string;
}

interface StartData {
  source?: string;
  referrer_id?: string;
}

export function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const isTelegram = !!tg;
    
    // Get startapp parameter from either Telegram or URL
    const getStartParam = () => {
      if (isTelegram) {
        return tg.initDataUnsafe.start_param;
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('startapp');
      }
    };

    // Get user data from either Telegram or mock data for testing
    const getUserData = () => {
      if (isTelegram) {
        return tg.initDataUnsafe.user;
      } else {
        // For testing outside Telegram, use URL parameters or mock data
        const urlParams = new URLSearchParams(window.location.search);
        return {
          id: urlParams.get('user_id') || 'test_user_123',
          username: urlParams.get('username') || 'testuser',
          first_name: urlParams.get('first_name') || 'Test User',
          photo_url: urlParams.get('photo_url') || null
        };
      }
    };

    const startApp = getStartParam();
    const userData = getUserData();
    
    const processUser = async () => {
      if (!userData) {
        setLoading(false);
        setShowOnboarding(true);
        return;
      }

      const {
        id: telegram_id,
        username,
        first_name,
        photo_url: avatar_url
      } = userData;

      try {
        // Try to get existing user
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('telegram_id', telegram_id)
          .maybeSingle();

        if (selectError) {
          console.error('Error checking user:', selectError);
          setShowOnboarding(true);
          return;
        }

        // Process start data if present
        let startData: string | null = null;
        if (startApp) {
          try {
            // Try parsing as base64
            const decodedData = atob(startApp);
            const parsedData: StartData = JSON.parse(decodedData);
            
            // Store only the source value
            startData = parsedData.source || null;

            // Handle referral data if present
            if (parsedData.referrer_id && parsedData.referrer_id !== telegram_id) {
              // Check if the referrer exists
              const { data: referrer } = await supabase
                .from('users')
                .select('telegram_id')
                .eq('telegram_id', parsedData.referrer_id)
                .single();

              if (referrer) {
                // Check if the user hasn't been referred before
                const { count: existingReferral } = await supabase
                  .from('referrals')
                  .select('*', { count: 'exact' })
                  .eq('referred_id', telegram_id);

                if (!existingReferral) {
                  // Create referral
                  const { error: referralError } = await supabase
                    .from('referrals')
                    .insert([{
                      referrer_id: parsedData.referrer_id,
                      referred_id: telegram_id
                    }]);

                  if (referralError && referralError.code !== '23505') {
                    console.error('Error creating referral:', referralError);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error processing start data:', error);
          }
        }

        if (existingUser) {
          // Update last login and other fields if they've changed
          const { error: updateError } = await supabase
            .from('users')
            .update({
              username,
              first_name,
              avatar_url,
              last_login: new Date().toISOString(),
              start_data: startData // Store only the source value
            })
            .eq('telegram_id', telegram_id);

          if (updateError && updateError.code !== '23505') {
            console.error('Error updating user:', updateError);
          }

          // Check if onboarding is needed
          setShowOnboarding(!existingUser.onboarding_completed);
        } else {
          // Create new user
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              telegram_id,
              username,
              first_name,
              avatar_url,
              points: 0,
              onboarding_completed: false,
              start_data: startData // Store only the source value
            }]);

          if (insertError && insertError.code !== '23505') {
            console.error('Error creating user:', insertError);
          }

          // Show onboarding for new users
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error saving user data:', error);
        setShowOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    // Initialize data processing
    const initializeData = async () => {
      await processUser();
      setDataInitialized(true);
    };

    initializeData().catch(console.error);

    // Preload logo
    const logo = new Image();
    logo.src = '/logo.svg';
    logo.onload = () => setLogoLoaded(true);
    logo.onerror = () => {
      console.error('Error loading logo');
      setLogoLoaded(true); // Continue anyway
    };

    return () => {
      setProgress(0);
      setDataInitialized(false);
      setAnimationComplete(false);
    };
  }, []);

  // Handle progress animation separately, dependent on data initialization and logo loading
  useEffect(() => {
    if (!dataInitialized || !logoLoaded) return;

    const duration = 2000; // 2 seconds
    const interval = 16; // ~60fps
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimationComplete(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [dataInitialized, logoLoaded]);

  // Handle completion
  useEffect(() => {
    if (animationComplete && !loading && !showOnboarding) {
      onComplete();
    }
  }, [animationComplete, loading, showOnboarding, onComplete]);

  const handleOnboardingComplete = async () => {
    onComplete();
  };

  if (showOnboarding && animationComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-4 z-50">
      <div className="mb-8 transform scale-100 sm:scale-125">
        <img 
          src="/logo.svg" 
          alt="Talentsy" 
          className="w-[160px] h-[64px] sm:w-[200px] sm:h-[80px]"
          onLoad={() => setLogoLoaded(true)}
        />
      </div>
      <div className="w-64 sm:w-80 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-[#865df6] transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}