
export interface Chapter {
  title: string;
}

export interface Subtopic {
  title: string;
  chapters: Chapter[];
}

export interface Subject {
  title: string;
  subtopics: Subtopic[];
}

export interface ChapterPath {
  subjectIdx: number;
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
    subjectTitle: string;
    subtopicTitle: string;
    chapterTitle: string;
}

// Grounding related types
export interface WebDetails {
    uri: string;
    title: string;
}

export interface GroundingChunk {
    web: WebDetails;
}

export interface GroundedSearchResponse {
    text: string;
    citations: GroundingChunk[];
}

export interface VisualConceptResponse {
    imageData: string;
}

// FIX: Add types for video generation
export interface VideoDetails {
    uri: string;
    aspectRatio?: '16:9' | '9:16';
}

export interface GeneratedVideo {
    video: VideoDetails;
}

export interface VideoGenerationResponse {
    generatedVideos: GeneratedVideo[];
}

export interface VideoOperation {
    done: boolean;
    response?: VideoGenerationResponse;
    name?: string;
    metadata?: any;
}