
import React, { useState, useEffect } from 'react';
import TopicsListView from './components/TopicsListView';
import TopicIndex from './components/TopicIndex';
import ChapterView from './components/ChapterView';
import QuizView from './components/QuizView';
import SearchBar from './components/SearchBar';
import Chatbot from './components/Chatbot';
import AudioTranscriber from './components/AudioTranscriber';
import type { ChapterPath, Progress, Topic } from './types';
import { COURSE_STRUCTURE } from './constants';
import { geminiService } from './services/geminiService';
import { LanguageProvider, useTranslation } from './i18n';

const AppContent: React.FC = () => {
  const [courseStructure, setCourseStructure] = useState<Topic[]>(() => {
    try {
        const savedStructure = localStorage.getItem('courseStructure');
        return savedStructure ? JSON.parse(savedStructure) : COURSE_STRUCTURE;
    } catch (e) {
        console.error("Failed to parse course structure from localStorage", e);
        return COURSE_STRUCTURE;
    }
  });
  const [selectedTopicIdx, setSelectedTopicIdx] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<ChapterPath | null>(null);
  const [quizState, setQuizState] = useState<{path: ChapterPath, content: string} | null>(null);
  
  const { language, setLanguage, t } = useTranslation();

  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const savedProgress = localStorage.getItem('learningProgress');
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch (e) {
      console.error("Failed to parse progress from localStorage", e);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('learningProgress', JSON.stringify(progress));
  }, [progress]);
  
  useEffect(() => {
    localStorage.setItem('courseStructure', JSON.stringify(courseStructure));
  }, [courseStructure]);

  const handleAddNewTopic = async (topicTitle: string) => {
    const subtopics = await geminiService.generateTopicStructure(topicTitle);
    if (subtopics && subtopics.length > 0) {
      const newTopic: Topic = { title: topicTitle, subtopics };
      setCourseStructure(prev => [...prev, newTopic]);
    } else {
      throw new Error("Could not generate topic structure.");
    }
  };

  const getChapterKey = (path: ChapterPath) => `${path.topicIdx}-${path.subtopicIdx}-${path.chapterIdx}`;

  const markChapterAsComplete = (path: ChapterPath) => {
    const key = getChapterKey(path);
    setProgress(prev => ({ ...prev, [key]: true }));
  };
  
  const handleResetProgress = () => {
    if (window.confirm(t('reset_progress_confirm'))) {
        setProgress({});
        localStorage.removeItem('learningProgress');
    }
  };

  const handleSelectChapter = (path: ChapterPath) => {
    setCurrentPath(path);
    setQuizState(null);
  };

  const handleStartQuiz = (path: ChapterPath, content: string) => {
    setQuizState({path, content});
    setCurrentPath(null);
  };
  
  const handleQuizComplete = () => {
    if(quizState) {
        setCurrentPath(quizState.path);
    }
    setQuizState(null);
  }

  const handleNavigate = (direction: 'next' | 'prev') => {
    if (!currentPath) return;

    let { topicIdx, subtopicIdx, chapterIdx } = currentPath;
    const currentSubtopic = courseStructure[topicIdx].subtopics[subtopicIdx];

    if (direction === 'next') {
      if (chapterIdx < currentSubtopic.chapters.length - 1) {
        chapterIdx++;
      } else if (subtopicIdx < courseStructure[topicIdx].subtopics.length - 1) {
        subtopicIdx++;
        chapterIdx = 0;
      } else if (topicIdx < courseStructure.length - 1) {
        topicIdx++;
        subtopicIdx = 0;
        chapterIdx = 0;
      } else {
        return;
      }
    } else {
      if (chapterIdx > 0) {
        chapterIdx--;
      } else if (subtopicIdx > 0) {
        subtopicIdx--;
        chapterIdx = courseStructure[topicIdx].subtopics[subtopicIdx].chapters.length - 1;
      } else if (topicIdx > 0) {
        topicIdx--;
        subtopicIdx = courseStructure[topicIdx].subtopics.length - 1;
        chapterIdx = courseStructure[topicIdx].subtopics[subtopicIdx].chapters.length - 1;
      } else {
        return;
      }
    }
    setCurrentPath({ topicIdx, subtopicIdx, chapterIdx });
    setQuizState(null);
  };
  
  const handleBackToTopicDetail = () => {
    if (currentPath) {
        markChapterAsComplete(currentPath);
    }
    setCurrentPath(null);
    setQuizState(null);
  };
  
  const renderContent = () => {
    if (quizState) {
        return <QuizView 
            path={quizState.path} 
            onQuizComplete={handleQuizComplete} 
            chapterContent={quizState.content} 
            courseStructure={courseStructure}
        />;
    }
    if (currentPath) {
        return <ChapterView 
              path={currentPath}
              courseStructure={courseStructure}
              onNavigate={handleNavigate}
              onBackToTopicDetail={handleBackToTopicDetail}
              onStartQuiz={handleStartQuiz}
              markChapterAsComplete={markChapterAsComplete}
            />;
    }
    if (selectedTopicIdx !== null) {
        return <TopicIndex 
            topic={courseStructure[selectedTopicIdx]}
            topicIdx={selectedTopicIdx}
            onSelectChapter={handleSelectChapter}
            progress={progress}
            onBackToTopics={() => setSelectedTopicIdx(null)}
            courseStructure={courseStructure}
        />
    }
    return <TopicsListView 
            topics={courseStructure}
            progress={progress}
            onSelectTopic={(idx) => setSelectedTopicIdx(idx)}
            onAddNewTopic={handleAddNewTopic}
            onResetProgress={handleResetProgress}
        />;
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    {t('app_title')}
                </h1>
                <button
                    onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                    className="bg-surface hover:bg-gray-700 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    aria-label={t('change_language_label')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.32 5.032A6.983 6.983 0 0110 4c1.534 0 2.95.483 4.135 1.287l-1.45 1.45A4.982 4.982 0 0010 6a4.982 4.982 0 00-2.832.83L6.32 5.032zM4.05 7.468A6.975 6.975 0 014 10c0 .99.208 1.922.58 2.764l1.52-1.52A4.978 4.978 0 006 10a4.978 4.978 0 00-.09-1.02l-1.86-1.512zM7.94 14.42A4.978 4.978 0 0010 14a4.978 4.978 0 002.54-.682l1.52 1.52A6.975 6.975 0 0110 16c-.99 0-1.922-.208-2.764-.58L7.94 14.42zM14.968 13.68A4.982 4.982 0 0014 10a4.982 4.982 0 00-.83-2.832L14.968 5.32A6.983 6.983 0 0116 10c0 1.534-.483 2.95-1.287 4.135l-1.45-1.45z" />
                    </svg>
                    {language === 'en' ? 'বাংলা' : 'English'}
                </button>
            </div>
            <SearchBar onSelectChapter={handleSelectChapter} courseStructure={courseStructure} />
        </header>
        
        <main>
          {renderContent()}
        </main>
      </div>
      <Chatbot />
      <AudioTranscriber />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);


export default App;
