
export interface Chapter {
  title: string;
}

export interface Subtopic {
  title: string;
  chapters: Chapter[];
}

export interface Topic {
  title: string;
  subtopics: Subtopic[];
}

export interface ChapterPath {
  topicIdx: number;
  subtopicIdx: number;
  chapterIdx: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type Progress = Record<string, boolean>;

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SearchResult {
    path: ChapterPath;
    topicTitle: string;
    subtopicTitle: string;
    chapterTitle: string;
}
