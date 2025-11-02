// FIX: Import VideoOperation type.
import type { QuizQuestion, Subtopic, GroundedSearchResponse, VideoOperation, VisualConceptResponse } from '../types';

const API_ENDPOINT = '/.netlify/functions/gemini';

// Helper function to call our serverless function
async function callApi<T>(action: string, payload: unknown): Promise<T> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API call failed for action ${action}:`, errorText);
      let errorMessage = `Server error: ${response.statusText}`;
      try {
        // Try to parse a structured error from the backend
        const errorPayload = JSON.parse(errorText);
        if (errorPayload.error) {
          errorMessage = errorPayload.error;
        }
      } catch (e) {
        // If the response is not JSON, use the raw text if it's not too long
        // This handles errors from gateways or other non-app sources
        if (errorText.length > 0 && errorText.length < 300) {
           errorMessage = errorText;
        }
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling API for action ${action}:`, error);
    // Ensure that what's thrown is always an Error object with a message.
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error) || 'An unknown client-side error occurred.');
  }
}

export const geminiService = {
  generateChapterContent: async (title: string): Promise<string> => {
    const result = await callApi<{ text: string }>('generateChapterContent', { title });
    return result.text;
  },

  startChat: (isThinkingMode: boolean) => {
    return {
      sendMessage: async (history: any[], message: string, language: 'en' | 'bn') => {
        const result = await callApi<{ text: string }>('sendMessage', { 
            history, 
            message, 
            isThinkingMode,
            language
        });
        return result;
      }
    };
  },
  
  generateQuiz: async (chapterTitle: string, chapterContent: string): Promise<QuizQuestion[]> => {
     try {
        const result = await callApi<QuizQuestion[]>('generateQuiz', { chapterTitle, chapterContent });
        return result;
     } catch(error) {
        return [];
     }
  },

  generateTopicStructure: async (topicTitle: string): Promise<Subtopic[]> => {
    try {
        const result = await callApi<Subtopic[]>('generateTopicStructure', { topicTitle });
        return result;
    } catch(error) {
        // Propagate the error to be handled by the UI
        throw error;
    }
  },
  
  translateContent: async (text: string, language: 'en' | 'bn'): Promise<string> => {
    if (language === 'en' || !text) {
      return text;
    }
    try {
       const result = await callApi<{ text: string }>('translateContent', { text, language });
       return result.text;
    } catch (error) {
       return text; // Fallback to original text on error
    }
  },
  
  groundedSearch: async (query: string): Promise<GroundedSearchResponse> => {
    return callApi<GroundedSearchResponse>('groundedSearch', { query });
  },

  generateVisualConcept: async (chapterTitle: string, chapterContent: string): Promise<VisualConceptResponse> => {
    return callApi<VisualConceptResponse>('generateVisualConcept', { chapterTitle, chapterContent });
  },

  generateVideo: async (
    prompt: string,
    image: { data: string; mimeType: string } | null,
    config: { resolution: string; aspectRatio: string; numberOfVideos: number }
  ): Promise<VideoOperation> => {
    return callApi<VideoOperation>('generateVideo', { prompt, image, config });
  },

  getVideoOperation: async (operation: VideoOperation): Promise<VideoOperation> => {
    return callApi<VideoOperation>('getVideoOperation', { operation });
  },

  connectLiveSession: () => {
    console.warn("Live transcription is disabled in this version for security reasons.");
    return null;
  },
};

// These helpers are no longer needed on the frontend as audio processing is disabled.
export function encode(bytes: Uint8Array): string { return ''; }
export function createPcmBlob(data: Float32Array) { return null; }