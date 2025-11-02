import type { QuizQuestion, Subtopic } from '../types';

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
      throw new Error(`Server error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling API for action ${action}:`, error);
    // Re-throw or return a specific error structure
    throw error;
  }
}

export const geminiService = {
  generateChapterContent: async (title: string): Promise<string> => {
    try {
      const result = await callApi<{ text: string }>('generateChapterContent', { title });
      return result.text;
    } catch (error) {
       return 'Sorry, there was an error generating the content for this chapter. Please try again later.';
    }
  },

  startChat: (isThinkingMode: boolean) => {
    // Chat is now stateful on the server, proxied through our function.
    // We pass messages instead of using the SDK's chat object directly.
    return {
      sendMessage: async (history: any[], message: string) => {
        const result = await callApi<{ text: string }>('sendMessage', { 
            history, 
            message, 
            isThinkingMode 
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
        return [];
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

  // NOTE: Live session via a simple serverless proxy is not feasible due to its stateful, long-running nature.
  // This functionality would require a more complex backend setup (e.g., a WebSocket server).
  // For now, we disable this feature in the secure, public version of the app.
  connectLiveSession: () => {
    console.warn("Live transcription is disabled in this version for security reasons.");
    return null;
  },
};

// These helpers are no longer needed on the frontend as audio processing is disabled.
export function encode(bytes: Uint8Array): string { return ''; }
export function createPcmBlob(data: Float32Array) { return null; }
