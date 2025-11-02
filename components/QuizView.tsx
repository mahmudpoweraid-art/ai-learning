
import React, { useState, useEffect, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import type { ChapterPath, QuizQuestion, Topic } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n';

interface QuizViewProps {
  path: ChapterPath;
  onQuizComplete: () => void;
  chapterContent: string;
  courseStructure: Topic[];
}

const QuizView: React.FC<QuizViewProps> = ({ path, onQuizComplete, chapterContent, courseStructure }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [translatedQuestions, setTranslatedQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const { language, t } = useTranslation();
  const chapter = courseStructure[path.topicIdx].subtopics[path.subtopicIdx].chapters[path.chapterIdx];
  
  const isQuizFinished = currentQuestionIndex >= questions.length;
  const displayQuestions = language === 'bn' ? translatedQuestions : questions;

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      const quizQuestions = await geminiService.generateQuiz(chapter.title, chapterContent);
      setQuestions(quizQuestions);
      setIsLoading(false);
    };
    if (chapterContent) {
      fetchQuiz();
    }
  }, [chapter.title, chapterContent]);
  
  const translateQuiz = useCallback(async (quiz: QuizQuestion[]) => {
      if (language !== 'bn' || quiz.length === 0) {
          setTranslatedQuestions(quiz);
          return;
      }
      setIsTranslating(true);
      const translated = await Promise.all(
          quiz.map(async (q) => ({
              ...q,
              question: await geminiService.translateContent(q.question, 'bn'),
              options: await Promise.all(q.options.map(opt => geminiService.translateContent(opt, 'bn'))),
              explanation: await geminiService.translateContent(q.explanation, 'bn'),
          }))
      );
      setTranslatedQuestions(translated);
      setIsTranslating(false);
  }, [language]);

  useEffect(() => {
      translateQuiz(questions);
  }, [questions, translateQuiz]);


  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === questions[currentQuestionIndex].correctAnswerIndex;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentQuestionIndex(i => i + 1);
  };
  
  const getButtonClass = (index: number) => {
    if (!showExplanation) {
        return "bg-gray-600 hover:bg-gray-500";
    }
    if (index === questions[currentQuestionIndex].correctAnswerIndex) {
        return "bg-green-600";
    }
    if (index === selectedAnswer) {
        return "bg-red-600";
    }
    return "bg-gray-600 opacity-50";
  };

  if (isLoading || isTranslating) {
    return (
      <div className="bg-surface p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">{t(isLoading ? 'generating_quiz' : 'translating_quiz')}</h2>
        <LoadingSpinner />
      </div>
    );
  }

  if (questions.length === 0 && !isLoading) {
    return (
       <div className="bg-surface p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-secondary">{t('quiz_for')} "{chapter.title}"</h2>
        <p className="text-text-secondary mb-6">{t('quiz_generation_error')}</p>
        <button onClick={onQuizComplete} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">
          {t('back_to_chapter')}
        </button>
      </div>
    );
  }

  if (isQuizFinished) {
    return (
      <div className="bg-surface p-8 rounded-lg shadow-lg text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-secondary mb-4">{t('quiz_complete')}</h2>
        <p className="text-xl text-text-primary mb-6">
          {t('your_score')}: <span className="font-bold text-primary">{score}</span> / <span className="font-bold">{questions.length}</span>
        </p>
        <button onClick={onQuizComplete} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">
          {t('return_to_learning')}
        </button>
      </div>
    );
  }

  const currentQuestion = displayQuestions[currentQuestionIndex];

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">{t('quiz_title')}: {chapter.title}</h1>
      <p className="text-text-secondary mb-6">{t('question_progress', { current: (currentQuestionIndex + 1).toString(), total: questions.length.toString() })}</p>
      
      <div className="my-6">
        <h2 className="text-xl text-text-primary">{currentQuestion.question}</h2>
      </div>

      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
            <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${getButtonClass(index)} disabled:cursor-not-allowed`}
            >
                {option}
            </button>
        ))}
      </div>

      {showExplanation && (
        <div className="mt-6 p-4 rounded-lg bg-gray-800 animate-fade-in">
            <p className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? t('correct') : t('incorrect')}
            </p>
            <p className="mt-2 text-text-secondary">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
        {showExplanation && (
            <button onClick={handleNextQuestion} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded">
                {currentQuestionIndex === questions.length - 1 ? t('finish_quiz') : t('next_question')}
            </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
