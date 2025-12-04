import React, { useState } from 'react';
import { WordEntry } from '../types';
import AudioButton from './AudioButton';
import { RotateCw } from 'lucide-react';

interface FlashcardProps {
  entry: WordEntry;
}

const Flashcard: React.FC<FlashcardProps> = ({ entry }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div 
      className="relative w-full h-96 cursor-pointer group perspective-1000"
      onClick={handleFlip}
    >
      <div className={`
        relative w-full h-full duration-500 transform-style-3d transition-transform
        ${isFlipped ? 'rotate-y-180' : ''}
      `}>
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden flex flex-col">
          <div className="h-3/5 w-full relative">
             {entry.imageUrl ? (
               <img src={entry.imageUrl} alt="Visual" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-pink-100 flex items-center justify-center text-pink-300">No Image</div>
             )}
             <div className="absolute inset-0 flex items-center justify-center bg-black/20">
             </div>
          </div>
          <div className="h-2/5 flex flex-col items-center justify-center bg-white p-4 text-center">
             <h3 className="text-3xl font-black text-slate-800 mb-2">{entry.term}</h3>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tap to flip</span>
          </div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-slate-900 text-white rounded-3xl shadow-xl p-8 flex flex-col justify-between">
          <div className="flex items-start justify-between">
             <div>
                <h3 className="text-2xl font-bold text-pink-400 mb-1">{entry.term}</h3>
                <p className="text-slate-400 text-sm">{entry.nativeDefinition}</p>
             </div>
             <div onClick={(e) => e.stopPropagation()}>
               <AudioButton text={entry.term} lang={entry.targetLang} />
             </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-lg font-medium">"{entry.examples[0]?.sentence}"</p>
              <p className="text-slate-400 text-sm mt-1">{entry.examples[0]?.translation}</p>
            </div>
          </div>

          <div className="flex justify-center mt-4">
             <RotateCw className="text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
