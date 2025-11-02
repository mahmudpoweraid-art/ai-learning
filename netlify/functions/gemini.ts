import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// The API key is now expected to be provided with each function invocation's environment.
// A top-level check might not be sufficient if keys can change per user session.

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST' || !event.body) {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    // API Key must be present for any function to work.
    if (!process.env.API_KEY) {
        return { statusCode: 401, body: JSON.stringify({ error: "API_KEY environment variable not set" }) };
    }

    try {
        const { action, payload } = JSON.parse(event.body);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const relaxedSafetySettings = [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
        ];

        switch (action) {
            case 'generateChapterContent': {
                const { title } = payload;
                const prompt = `Explain the topic "${title}" for a beginner in the tech field. Structure the explanation with clear headings, bullet points for key concepts, and a simple example if applicable. The tone should be encouraging and easy to understand.`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    safetySettings: relaxedSafetySettings,
                });
                return { statusCode: 200, body: JSON.stringify({ text: response.text }) };
            }
            
            case 'sendMessage': {
                const { history, message, isThinkingMode, language } = payload;
                const modelName = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
                const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
                
                let systemInstruction = 'You are a helpful AI assistant specialized in technology and AI topics. Answer user questions clearly and concisely.';
                if (language === 'bn') {
                    systemInstruction += ' IMPORTANT: Your response MUST be in Bengali. However, keep all technical terms, code snippets, and proper nouns (like "Google AI Studio", "API", "Cybersecurity", "JSON", "React", "JavaScript") in their original English form.'
                }

                const chat = ai.chats.create({
                    model: modelName,
                    history: history,
                    config: {
                      ...config,
                      systemInstruction,
                    },
                });

                const response = await chat.sendMessage({ message });
                return { statusCode: 200, body: JSON.stringify({ text: response.text }) };
            }

            case 'generateQuiz': {
                const { chapterTitle, chapterContent } = payload;
                const prompt = `Based on the following content for the chapter titled "${chapterTitle}", generate a short 3-question multiple-choice quiz. For each question, provide 4 distinct options, the 0-based index of the correct answer, and a brief explanation for the correct answer.

                Chapter Content:\n---\n${chapterContent}\n---`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswerIndex: { type: Type.INTEGER },
                                explanation: { type: Type.STRING },
                              },
                              required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
                            },
                        }
                    },
                    safetySettings: relaxedSafetySettings,
                });
                return { statusCode: 200, body: response.text };
            }

            case 'generateTopicStructure': {
                const { topicTitle } = payload;
                const prompt = `Generate a concise course structure for the topic "${topicTitle}". The structure should contain 2 to 4 relevant subtopics, and each subtopic should have 3 to 5 chapter titles. The target audience is beginners.`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    chapters: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: { title: { type: Type.STRING } },
                                            required: ['title'],
                                        },
                                    },
                                },
                                required: ['title', 'chapters'],
                            },
                        }
                    },
                    safetySettings: relaxedSafetySettings,
                });
                return { statusCode: 200, body: response.text };
            }

            case 'translateContent': {
                const { text } = payload;
                const prompt = `Translate the following text to Bengali. IMPORTANT: Keep all technical terms, code snippets, and proper nouns (like "Google AI Studio", "API", "Cybersecurity", "JSON", "React", "JavaScript") in their original English form. Only translate the descriptive and explanatory text around them.\n\nText to translate:\n---\n${text}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                return { statusCode: 200, body: JSON.stringify({ text: response.text }) };
            }
            
            case 'groundedSearch': {
                const { query } = payload;
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: query,
                    config: {
                      tools: [{googleSearch: {}}],
                    },
                });
                
                const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
                
                return { statusCode: 200, body: JSON.stringify({ text: response.text, citations }) };
            }
            
            case 'generateVisualConcept': {
                const { chapterTitle, chapterContent } = payload;
                const prompt = `Based on the following chapter content for "${chapterTitle}", generate a clear and simple visual diagram, concept map, or infographic that explains the main concept. The style should be like a clean whiteboard sketch. Focus on the core idea and use minimal text.

                Content:\n---\n${chapterContent}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: prompt }] },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                    safetySettings: relaxedSafetySettings,
                });

                const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
                if (imagePart?.inlineData) {
                    return { statusCode: 200, body: JSON.stringify({ imageData: imagePart.inlineData.data }) };
                } else {
                    throw new Error("Image data was not found in the response.");
                }
            }

            case 'generateVideo': {
                const { prompt, image, config } = payload;
                const generateVideosPayload: {
                    model: string;
                    prompt: string;
                    config: any;
                    image?: { imageBytes: string; mimeType: string; };
                } = {
                    model: 'veo-3.1-fast-generate-preview',
                    prompt,
                    config,
                };
                if (image) {
                    generateVideosPayload.image = {
                        imageBytes: image.data,
                        mimeType: image.mimeType,
                    };
                }
                const operation = await ai.models.generateVideos(generateVideosPayload);
                return { statusCode: 200, body: JSON.stringify(operation) };
            }

            case 'getVideoOperation': {
                const { operation } = payload;
                const updatedOperation = await ai.operations.getVideosOperation({ operation });
                return { statusCode: 200, body: JSON.stringify(updatedOperation) };
            }


            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
        }
    } catch (error: any) {
        console.error('Error in serverless function:', error);
        const errorMessage = error.response?.data?.error?.message || error.message || 'An internal error occurred';
        return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
    }
};

export { handler };