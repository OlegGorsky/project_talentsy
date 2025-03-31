import React, { useState } from 'react';
import { useKeywordCompletion } from '../../hooks/useKeywordCompletion';

interface KeywordInputProps {
  onComplete: () => void;
}

export function KeywordInput({ onComplete }: KeywordInputProps) {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const { isSubmitting, submitKeyword } = useKeywordCompletion();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setError('');
    if (!keyword.trim()) {
      setError('Введите ключевое слово');
      return;
    }

    try {
      await submitKeyword(keyword);
      onComplete();
      setKeyword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте позже.');
    }
  };

  return (
    <div className="bg-[#865df6] text-white p-6 rounded-xl shadow-lg">
      <h4 className="font-semibold mb-4">Введите ключевое слово из статьи</h4>
      
      <div className="space-y-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setError('');
          }}
          placeholder="Ключевое слово"
          className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 focus:outline-none focus:border-opacity-40"
        />
        
        {error && (
          <p className="text-red-200 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-white text-[#865df6] py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Проверяем...' : 'Проверить'}
        </button>
      </div>
    </div>
  );
}