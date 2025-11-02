import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import type { VideoOperation } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n';

interface VideoPlaygroundProps {
    onApiKeyError: () => void;
    onBack: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const GENERATING_MESSAGES_KEY = 'generating_video_messages';

const VideoPlayground: React.FC<VideoPlaygroundProps> = ({ onApiKeyError, onBack }) => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const messageIntervalRef = useRef<number | null>(null);
    const generatingMessages = t(GENERATING_MESSAGES_KEY).split(';');

    useEffect(() => {
        if (isLoading) {
            setLoadingMessage(generatingMessages[0]);
            messageIntervalRef.current = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = generatingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % generatingMessages.length;
                    return generatingMessages[nextIndex];
                });
            }, 3000);
        } else if (messageIntervalRef.current) {
            clearInterval(messageIntervalRef.current);
            messageIntervalRef.current = null;
        }

        return () => {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
        };
    }, [isLoading, generatingMessages]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64Data = await fileToBase64(file);
            setImage({
                data: base64Data,
                mimeType: file.type,
                preview: URL.createObjectURL(file),
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!prompt || !prompt.trim()) && !image) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            let operation: VideoOperation = await geminiService.generateVideo(
                prompt, 
                image, 
                { resolution, aspectRatio, numberOfVideos: 1 }
            );

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await geminiService.getVideoOperation(operation);
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                setVideoUrl(downloadLink);
            } else {
                throw new Error("Video generation finished but no URL was returned.");
            }

        } catch (err: any) {
            console.error(err);
            if (typeof err.message === 'string' && err.message.includes("Requested entity was not found")) {
                onApiKeyError();
            } else {
                setError(t('video_generation_error'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface p-6 sm:p-8 rounded-lg shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-secondary">{t('video_playground_title')}</h1>
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                    &larr; {t('back_to_learning')}
                </button>
            </div>
            <p className="text-text-secondary mb-6">{t('video_playground_desc')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-text-primary mb-2">Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('prompt_placeholder')}
                        className="w-full bg-background p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">{t('upload_image_prompt')}</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-indigo-500"/>
                    {image?.preview && <img src={image.preview} alt="Preview" className="mt-4 rounded-lg max-h-40" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="resolution" className="block text-sm font-medium text-text-primary mb-2">Resolution</label>
                        <select id="resolution" value={resolution} onChange={e => setResolution(e.target.value as any)} disabled={isLoading} className="w-full bg-background p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="720p">720p</option>
                            <option value="1080p">1080p</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-text-primary mb-2">Aspect Ratio</label>
                        <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} disabled={isLoading} className="w-full bg-background p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={isLoading || (!prompt.trim() && !image)} className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex justify-center items-center h-12">
                    {isLoading ? <LoadingSpinner /> : t('generate_video')}
                </button>
            </form>
            
            {isLoading && (
                <div className="text-center mt-8 p-4 bg-gray-800 rounded-lg">
                    <p className="text-text-secondary">{loadingMessage}</p>
                </div>
            )}
            
            {error && <p className="text-red-400 text-center mt-6">{error}</p>}
            
            {videoUrl && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-center mb-4">Your video is ready!</h3>
                    <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default VideoPlayground;
