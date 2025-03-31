import React, { useState } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import { useKeywordCompletion } from '../../hooks/useKeywordCompletion';

interface KeywordTaskProps {
  onShowArticle: () => void;
}

export function KeywordTask({ onShowArticle }: KeywordTaskProps) {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const { completed, isSubmitting, submitKeyword } = useKeywordCompletion();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setError('');
    try {
      await submitKeyword(keyword);
      setKeyword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте позже.');
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onShowArticle}
        className="w-full bg-[#865df6] text-white py-2.5 rounded-lg font-medium hover:bg-[#7147f5] transition-colors"
      >
        Читать статью
      </button>

      {!completed && (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setError('');
            }}
            placeholder="Ключевое слово"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865df6] focus:border-transparent"
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full bg-[#865df6] text-white py-2.5 rounded-lg font-medium transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#7147f5]'
            }`}
          >
            {isSubmitting ? 'Проверяем...' : 'Подтвердить'}
          </button>
        </div>
      )}

      {completed && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
          <CheckCircle className="mx-auto mb-2" size={24} />
          <p className="font-medium">Задание выполнено!</p>
          <p className="text-sm">Вы получили 100 баллов</p>
        </div>
      )}
    </div>
  );
}