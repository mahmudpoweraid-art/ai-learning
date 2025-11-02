import React from 'react';

// The AudioTranscriber feature is disabled in the production version because
// live audio streaming cannot be securely proxied through a simple serverless function.
// This requires a more advanced backend architecture (e.g., a WebSocket server).
const AudioTranscriber: React.FC = () => {
    return null; 
};

export default AudioTranscriber;
