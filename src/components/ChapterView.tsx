import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ChapterPath, Topic } from '../types';
import { geminiService } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import VisualizerModal from './VisualizerModal';
import { useTranslation } from '../i18n';

interface ChapterViewProps {
  path: ChapterPath;
  courseStructure: Topic[];
  onNavigate: (direction: 'next' | 'prev') => void;
  onBackToTopicDetail: () => void;
  onStartQuiz: (path: ChapterPath, content: string) => void;
  markChapterAsComplete: (path: ChapterPath) => void;
}

const ChapterView: React.FC<ChapterViewProps> = ({ path, courseStructure, onNavigate, onBackToTopicDetail, onStartQuiz, markChapterAsComplete }) => {
  const [content, setContent] = useState<string>('');
  const [rawContent, setRawContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedSuccessfully = useRef(false);

  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizerError, setVisualizerError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const { language, t } = useTranslation();

  const { topicIdx, subtopicIdx, chapterIdx } = path;
  const chapter = courseStructure[topicIdx].subtopics[subtopicIdx].chapters[chapterIdx];

  const handleMarkComplete = useCallback(() => {
    markChapterAsComplete(path);
  }, [markChapterAsComplete, path]);

  useEffect(() => {
    hasLoadedSuccessfully.current = false; // Reset on new chapter fetch
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const generatedContent = await geminiService.generateChapterContent(chapter.title);
        setRawContent(generatedContent);
        setContent(generatedContent);
        hasLoadedSuccessfully.current = true; // Mark as successful
      } catch (e: any) {
        setError(e.message || t('chapter_generation_error'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();

    return () => {
      // Mark chapter as complete on unmount only if it was loaded successfully
      if (hasLoadedSuccessfully.current) {
        handleMarkComplete();
      }
    };
  }, [chapter.title, handleMarkComplete, t]);
  
  useEffect(() => {
    const translateContent = async () => {
        if (rawContent && language === 'bn') {
            setIsTranslating(true);
            const translated = await geminiService.translateContent(rawContent, 'bn');
            setContent(translated);
            setIsTranslating(false);
        } else {
            setContent(rawContent);
        }
    };
    translateContent();
  }, [language, rawContent]);
  
  const handleVisualize = async () => {
    if (!rawContent) return;
    setIsVisualizing(true);
    setVisualizerError(null);
    setGeneratedImage(null);
    try {
        const response = await geminiService.generateVisualConcept(chapter.title, rawContent);
        if(response.imageData) {
            setGeneratedImage(`data:image/png;base64,${response.imageData}`);
        } else {
            throw new Error("No image data received.");
        }
    } catch (e) {
        setVisualizerError(t('visualizer_error_message'));
    }
  };


  const isFirstChapter = topicIdx === 0 && subtopicIdx === 0 && chapterIdx === 0;
  const lastTopic = courseStructure[courseStructure.length - 1];
  const lastSubtopic = lastTopic.subtopics[lastTopic.subtopics.length - 1];
  const isLastChapter = topicIdx === courseStructure.length - 1 &&
                      subtopicIdx === lastTopic.subtopics.length - 1 &&
                      chapterIdx === lastSubtopic.chapters.length - 1;
  
  const isActionInProgress = isLoading || isTranslating || isVisualizing;

  const renderContent = () => {
    if (isLoading || isTranslating) {
      return (
        <div className="text-center p-8">
            <LoadingSpinner />
            <p className="mt-4 text-text-secondary">
                {isLoading 
                    ? t('generating_chapter_content', { chapterTitle: chapter.title }) 
                    : t('translating_chapter_content')}
            </p>
        </div>
      );
    }
    if (error) {
        return (
            <div className="text-center p-8 text-red-400 bg-red-500/10 rounded-lg">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
            </div>
        );
    }
    return <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">{content}</div>
  };

  return (
    <>
      <VisualizerModal
        isOpen={isVisualizing}
        onClose={() => setIsVisualizing(false)}
        isLoading={!generatedImage && !visualizerError}
        error={visualizerError}
        imageData={generatedImage}
        title={t('visualizer_modal_title')}
      />
      <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-2">{chapter.title}</h1>
        <p className="text-text-secondary mb-6">{courseStructure[topicIdx].title} / {courseStructure[topicIdx].subtopics[subtopicIdx].title}</p>
        
        {renderContent()}
        
        {!isLoading && content && !error && (
          <div className="flex justify-center items-center gap-4 flex-wrap mt-8">
            <button
              onClick={handleVisualize}
              disabled={isActionInProgress}
              className="bg-primary/80 hover:bg-primary text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 transform active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {t('visualize_concept_button')}
            </button>
            <button
              onClick={() => onStartQuiz(path, rawContent)} // Always quiz on raw English content
              disabled={isActionInProgress}
              className="bg-secondary hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 transform active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('test_your_knowledge')}
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
          <button
            onClick={onBackToTopicDetail}
            disabled={isActionInProgress}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 transform active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('back_to_chapter_list')}
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => onNavigate('prev')}
              disabled={isFirstChapter || isActionInProgress}
              className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60 transform active:scale-95"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => onNavigate('next')}
              disabled={isLastChapter || isActionInProgress}
              className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60 transform active:scale-95"
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterView;