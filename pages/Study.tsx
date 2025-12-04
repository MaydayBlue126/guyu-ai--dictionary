import React, { useState } from 'react';
import { WordEntry } from '../types';
import Flashcard from '../components/Flashcard';
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

interface StudyPageProps {
  notebook: WordEntry[];
}

const StudyPage: React.FC<StudyPageProps> = ({ notebook }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (notebook.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Nothing to study yet!</h2>
        <p className="text-slate-500">Add words to your notebook first.</p>
      </div>
    );
  }

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % notebook.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + notebook.length) % notebook.length);
  };

  const currentEntry = notebook[currentIndex];

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-800">Flashcards</h1>
        <p className="text-slate-500 text-sm font-medium">Card {currentIndex + 1} of {notebook.length}</p>
      </div>

      <div className="w-full">
        <Flashcard key={currentEntry.id} entry={currentEntry} />
      </div>

      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={prevCard}
          className="p-4 rounded-full bg-white shadow-md text-slate-600 hover:bg-slate-50 hover:text-pink-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <button 
          onClick={nextCard}
          className="p-4 rounded-full bg-slate-900 shadow-xl text-white hover:bg-pink-600 transition-colors transform hover:scale-110"
        >
          <ArrowRight size={28} />
        </button>
      </div>
      
      <div className="text-center">
        <button 
          onClick={() => setCurrentIndex(0)} 
          className="text-xs text-slate-400 flex items-center justify-center gap-1 mx-auto hover:text-slate-600"
        >
           <RefreshCw size={12} /> Restart
        </button>
      </div>
    </div>
  );
};

export default StudyPage;
