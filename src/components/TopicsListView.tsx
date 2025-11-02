import React, { useState, useEffect } from 'react';
import type { Topic, Progress, ChapterPath } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n';

interface TopicsListViewProps {
    topics: Topic[];
    progress: Progress;
    onSelectTopic: (index: number) => void;
    onAddNewTopic: (title: string) => Promise<void>;
    onResetProgress: () => void;
    onDeleteTopic: (index: number) => void;
    onNavigateToResearch: () => void;
}

const WelcomeMessage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const welcomeDismissed = localStorage.getItem('welcomeDismissed');
        if (!welcomeDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('welcomeDismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="bg-primary/20 border border-primary/50 text-text-primary p-4 rounded-lg shadow-lg relative mb-8 animate-fade-in">
            <button 
                onClick={handleDismiss} 
                className="absolute top-2 right-2 text-text-secondary hover:text-text-primary"
                aria-label={t('dismiss_welcome_message')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {/* FIX: Corrected typo from hh2 to h2 */}
            <h2 className="text-xl font-bold text-secondary mb-2">{t('welcome_title')}</h2>
            <p className="text-text-secondary">{t('welcome_message')}</p>
        </div>
    );
};

const CheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const TopicsListView: React.FC<TopicsListViewProps> = ({ topics, progress, onSelectTopic, onAddNewTopic, onResetProgress, onDeleteTopic, onNavigateToResearch }) => {
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const getChapterKey = (path: ChapterPath) => `${path.topicIdx}-${path.subtopicIdx}-${path.chapterIdx}`;
    const isChapterComplete = (path: ChapterPath) => !!progress[getChapterKey(path)];
    
    const isTopicComplete = (topic: Topic, topicIdx: number) => {
        return topic.subtopics.every((subtopic, subtopicIdx) => 
            subtopic.chapters.every((_, chapterIdx) => isChapterComplete({ topicIdx, subtopicIdx, chapterIdx }))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;
        
        setIsAdding(true);
        setError('');
        try {
            await onAddNewTopic(newTopicTitle);
            setNewTopicTitle('');
        } catch (err) {
            setError(t('add_topic_error'));
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <WelcomeMessage />
            <div className="bg-surface p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-secondary mb-4">{t('add_new_topic')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-text-secondary">{t('add_topic_description')}</p>
                    <input 
                        type="text" 
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder={t('add_topic_placeholder')}
                        className="w-full bg-background p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isAdding}
                    />
                    <button 
                        type="submit" 
                        disabled={isAdding || !newTopicTitle.trim()}
                        className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isAdding ? <LoadingSpinner /> : t('generate_and_add_topic')}
                    </button>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </form>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">{t('available_topics')}</h2>
                    <button 
                        onClick={onResetProgress}
                        className="text-sm text-text-secondary hover:text-red-400 transition-colors"
                    >
                        {t('reset_progress')}
                    </button>
                </div>
                
                <div 
                    onClick={onNavigateToResearch}
                    className="w-full text-left bg-surface p-6 rounded-lg shadow-lg hover:bg-gray-700/50 transition-colors duration-200 flex justify-between items-center cursor-pointer border-2 border-dashed border-secondary/50"
                >
                    <div>
                        <h3 className="text-xl font-semibold text-secondary">{t('research_assistant_title')}</h3>
                        <p className="text-text-secondary text-sm mt-1">{t('research_assistant_desc')}</p>
                    </div>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary flex-shrink-0 ml-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.32 5.032A6.983 6.983 0 0110 4c1.534 0 2.95.483 4.135 1.287l-1.45 1.45A4.982 4.982 0 0010 6a4.982 4.982 0 00-2.832.83L6.32 5.032zM4.05 7.468A6.975 6.975 0 014 10c0 .99.208 1.922.58 2.764l1.52-1.52A4.978 4.978 0 006 10a4.978 4.978 0 00-.09-1.02l-1.86-1.512zM7.94 14.42A4.978 4.978 0 0010 14a4.978 4.978 0 002.54-.682l1.52 1.52A6.975 6.975 0 0110 16c-.99 0-1.922-.208-2.764-.58L7.94 14.42zM14.968 13.68A4.982 4.982 0 0014 10a4.982 4.982 0 00-.83-2.832L14.968 5.32A6.983 6.983 0 0116 10c0 1.534-.483 2.95-1.287 4.135l-1.45-1.45z" />
                    </svg>
                </div>

                {topics.map((topic, index) => (
                    <div 
                        key={`${topic.title}-${index}`} 
                        className="bg-surface rounded-lg shadow-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center group"
                    >
                        <button 
                            onClick={() => onSelectTopic(index)}
                            className="flex-grow text-left p-6 flex items-center gap-4"
                        >
                            <span className="text-xl font-semibold text-text-primary">{topic.title}</span>
                        </button>
                        <div className="flex-shrink-0 flex items-center gap-2 pr-4">
                             {isTopicComplete(topic, index) && <CheckmarkIcon />}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent topic selection
                                    if (window.confirm(t('delete_topic_confirm', { topicTitle: topic.title }))) {
                                        onDeleteTopic(index);
                                    }
                                }}
                                className="text-gray-500 hover:text-red-400 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label={t('delete_topic_label', { topicTitle: topic.title })}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopicsListView;