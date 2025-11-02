
import React, { useState, useEffect, useCallback } from 'react';
import type { ChapterPath, Topic } from '../types';
import { geminiService } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
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

  const { language, t } = useTranslation();

  const { topicIdx, subtopicIdx, chapterIdx } = path;
  const chapter = courseStructure[topicIdx].subtopics[subtopicIdx].chapters[chapterIdx];

  const handleMarkComplete = useCallback(() => {
    markChapterAsComplete(path);
  }, [markChapterAsComplete, path]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const generatedContent = await geminiService.generateChapterContent(chapter.title);
      setRawContent(generatedContent);
      setContent(generatedContent);
      setIsLoading(false);
    };
    fetchContent();

    return () => {
      handleMarkComplete();
    };
  }, [chapter.title, handleMarkComplete]);
  
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


  const isFirstChapter = topicIdx === 0 && subtopicIdx === 0 && chapterIdx === 0;
  const lastTopic = courseStructure[courseStructure.length - 1];
  const lastSubtopic = lastTopic.subtopics[lastTopic.subtopics.length - 1];
  const isLastChapter = topicIdx === courseStructure.length - 1 &&
                      subtopicIdx === lastTopic.subtopics.length - 1 &&
                      chapterIdx === lastSubtopic.chapters.length - 1;

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-2">{chapter.title}</h1>
      <p className="text-text-secondary mb-6">{courseStructure[topicIdx].title} / {courseStructure[topicIdx].subtopics[subtopicIdx].title}</p>
      
      <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
        {isLoading || isTranslating ? <LoadingSpinner /> : content}
      </div>
      
      {!isLoading && content && (
        <div className="text-center mt-8">
          <button
            onClick={() => onStartQuiz(path, rawContent)} // Always quiz on raw English content
            className="bg-secondary hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 transform active:scale-95"
          >
            {t('test_your_knowledge')}
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
        <button
          onClick={onBackToTopicDetail}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 transform active:scale-95"
        >
          {t('back_to_chapter_list')}
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('prev')}
            disabled={isFirstChapter}
            className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60 transform active:scale-95"
          >
            {t('previous')}
          </button>
          <button
            onClick={() => onNavigate('next')}
            disabled={isLastChapter}
            className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60 transform active:scale-95"
          >
            {t('next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterView;
