
import React from 'react';
import { useTranslation } from '../i18n';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const { t } = useTranslation();

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        onKeySelected();
      } else {
        alert("API Key selection is not available in this environment.");
      }
    } catch (e) {
      console.error("Failed to open API key selector", e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center text-center p-4">
      <div className="bg-surface p-8 rounded-lg shadow-2xl max-w-lg w-full animate-fade-in">
        <h1 className="text-3xl font-bold text-secondary mb-4">{t('api_key_required_title')}</h1>
        <p className="text-text-secondary mb-6">{t('api_key_required_desc')}</p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 transform active:scale-95"
        >
          {t('select_api_key_button')}
        </button>
        <p className="text-xs text-gray-500 mt-4">
          {t('api_key_billing_notice')}{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            {t('learn_more')}
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelector;
