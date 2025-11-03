
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language, t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        const chatHistory = newMessages.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));
        
        const chatProxy = geminiService.startChat();
        const response = await chatProxy.sendMessage(chatHistory, input, language);

        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { role: 'model', text: error.message || t('chat_error') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary hover:bg-indigo-500 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"
          aria-label={t('toggle_chatbot')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-5 w-full max-w-md h-[70vh] max-h-[600px] bg-surface rounded-lg shadow-2xl flex flex-col z-40 animate-fade-in-up">
          <header className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">{t('ai_assistant')}</h2>
          </header>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-600 text-text-primary'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-gray-600 p-3 rounded-lg"><LoadingSpinner /></div></div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex items-center bg-gray-700 rounded-lg">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('ask_me_anything')}
                className="flex-1 bg-transparent p-3 focus:outline-none text-text-primary"
                disabled={isLoading}
              />
              <button type="submit" className="p-3 text-primary disabled:text-gray-500" disabled={isLoading || !input.trim()} aria-label={t('send_message')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;