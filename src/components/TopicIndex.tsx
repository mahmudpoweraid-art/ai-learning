
import React from 'react';
import type { ChapterPath, Progress, Subject, Subtopic } from '../types';
import { useTranslation } from '../i18n';

interface SubjectIndexProps {
  subject: Subject;
  subjectIdx: number;
  courseStructure: Subject[]; // needed for progress calculation context
  onSelectChapter: (path: ChapterPath) => void;
  progress: Progress;
  onBackToSubjects: () => void;
}

const CheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


const SubjectIndex: React.FC<SubjectIndexProps> = ({ subject, subjectIdx, courseStructure, onSelectChapter, progress, onBackToSubjects }) => {
  const { t } = useTranslation();

  const getChapterKey = (path: ChapterPath) => `${path.subjectIdx}-${path.subtopicIdx}-${path.chapterIdx}`;
  const isChapterComplete = (path: ChapterPath) => !!progress[getChapterKey(path)];
  
  const isSubtopicComplete = (subtopic: Subtopic, subtopicIdx: number) => {
      return subtopic.chapters.every((_, chapterIdx) => isChapterComplete({ subjectIdx, subtopicIdx, chapterIdx }));
  };

  const isSubjectComplete = () => {
      return subject.subtopics.every((subtopic, subtopicIdx) => isSubtopicComplete(subtopic, subtopicIdx));
  };


  return (
    <div className="space-y-8 animate-fade-in">
        <div className="bg-surface p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-secondary">{subject.title}</h2>
                {isSubjectComplete() && <CheckmarkIcon />}
              </div>
              <button
                onClick={onBackToSubjects}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                &larr; {t('all_subjects')}
              </button>
          </div>
          <div className="space-y-4">
            {subject.subtopics.map((subtopic, subtopicIdx) => (
              <div key={subtopic.title}>
                 <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-text-primary">{subtopic.title}</h3>
                    {isSubtopicComplete(subtopic, subtopicIdx) && <CheckmarkIcon />}
                 </div>
                <ul className="space-y-2">
                  {subtopic.chapters.map((chapter, chapterIdx) => {
                    const path = { subjectIdx, subtopicIdx, chapterIdx };
                    return (
                        <li key={chapter.title} className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectChapter(path)}
                            className="w-full text-left text-text-secondary hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-gray-700/50 flex-1"
                          >
                            {chapter.title}
                          </button>
                          {isChapterComplete(path) && <CheckmarkIcon />}
                        </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default SubjectIndex;