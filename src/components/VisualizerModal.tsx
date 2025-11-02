import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n';

interface VisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  imageData: string | null;
  title: string;
}

const VisualizerModal: React.FC<VisualizerModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  error,
  imageData,
  title
}) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-secondary">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="p-6 flex-grow overflow-y-auto flex justify-center items-center">
          {isLoading && (
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-text-secondary">{t('visualizer_loading_message')}</p>
            </div>
          )}
          {error && <p className="text-red-400">{error}</p>}
          {imageData && (
            <img
              src={imageData}
              alt="AI generated concept visualization"
              className="max-w-full max-h-full object-contain rounded-md"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizerModal;