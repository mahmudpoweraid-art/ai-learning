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


// FIX: Add types for video generation to resolve missing type errors.
// Video Generation Types
export interface Video {
    uri: string;
    aspectRatio?: '16:9' | '9:16';
}

export interface GeneratedVideo {
    video: Video;
}

export interface VideoGenerationResponse {
    generatedVideos: GeneratedVideo[];
}

export interface VideoOperation {
    name: string;
    done: boolean;
    response?: VideoGenerationResponse;
}