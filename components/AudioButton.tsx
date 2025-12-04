import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { playAudio } from '../services/geminiService';
import { Language } from '../types';

interface AudioButtonProps {
  text: string;
  lang: Language;
  size?: 'sm' | 'md';
}

const AudioButton: React.FC<AudioButtonProps> = ({ text, lang, size = 'md' }) => {
  const [loading, setLoading] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await playAudio(text, lang);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className={`
        inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors
        ${size === 'sm' ? 'p-1.5' : 'p-2.5'}
      `}
      aria-label="Play audio"
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Volume2 size={iconSize} />
      )}
    </button>
  );
};

export default AudioButton;
