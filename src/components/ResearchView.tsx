import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import type { GroundedSearchResponse } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n';

interface ResearchViewProps {
  onBack: () => void;
}

const ResearchView: React.FC<ResearchViewProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<GroundedSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await geminiService.groundedSearch(query);
      setResult(response);
    } catch (err: any) {
      setError(err.message || t('research_error_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-secondary">{t('research_assistant_title')}</h1>
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          &larr; {t('all_topics')}
        </button>
      </div>
      <p className="text-text-secondary mb-6">{t('research_assistant_desc')}</p>

      <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('research_placeholder')}
          className="flex-grow bg-background p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? <LoadingSpinner /> : t('research_button')}
        </button>
      </form>

      {isLoading && (
        <div className="text-center p-8">
            <LoadingSpinner />
        </div>
      )}

      {error && <p className="text-red-400 text-center">{error}</p>}

      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
            {result.text}
          </div>
          
          {result.citations.length > 0 && (
            <div>
                <h2 className="text-xl font-semibold text-text-primary border-t border-gray-700 pt-6 mt-6">{t('research_sources_title')}</h2>
                <ul className="list-disc list-inside mt-4 space-y-2">
                    {result.citations.map((citation, index) => (
                        <li key={index} className="text-text-secondary">
                            <a 
                                href={citation.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {citation.web.title || citation.web.uri}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchView;
