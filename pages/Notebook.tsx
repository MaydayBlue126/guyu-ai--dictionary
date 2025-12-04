import React, { useState } from 'react';
import { Trash2, Sparkles, BookOpen } from 'lucide-react';
import { WordEntry, Language } from '../types';
import * as GeminiService from '../services/geminiService';
import AudioButton from '../components/AudioButton';

interface NotebookPageProps {
  notebook: WordEntry[];
  removeFromNotebook: (id: string) => void;
  targetLang: Language;
}

const NotebookPage: React.FC<NotebookPageProps> = ({ notebook, removeFromNotebook, targetLang }) => {
  const [story, setStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateStory = async () => {
    if (notebook.length === 0) return;
    setIsGenerating(true);
    setStory(null);
    try {
      // Pick random 10 words if there are too many
      const subset = notebook.length > 10 
        ? [...notebook].sort(() => 0.5 - Math.random()).slice(0, 10) 
        : notebook;
        
      const generatedStory = await GeminiService.generateStory(subset, targetLang);
      setStory(generatedStory);
    } catch (err) {
      console.error(err);
      alert("Failed to generate story. Try again!");
    } finally {
      setIsGenerating(false);
    }
  };

  if (notebook.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="bg-white p-6 rounded-full shadow-lg">
          <BookOpen size={48} className="text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">Your notebook is empty!</h2>
        <p className="text-slate-500">Go search for some cool words to save them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-800">My Notebook</h1>
           <p className="text-slate-500">{notebook.length} saved words</p>
        </div>
        <button 
          onClick={handleGenerateStory}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Sparkles className="animate-spin" /> : <Sparkles />}
          {isGenerating ? "Weaving Magic..." : "Make me a Story!"}
        </button>
      </div>

      {/* Story Section */}
      {story && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-100 animate-fade-in-up">
          <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span> AI Story Time
          </h3>
          <div className="prose prose-lg text-slate-700 max-w-none whitespace-pre-line leading-relaxed">
            {story}
          </div>
          <div className="mt-6 flex justify-end">
            <AudioButton text={story} lang={targetLang} />
          </div>
        </div>
      )}

      {/* Grid of Words */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notebook.map((entry) => (
          <div key={entry.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
            <button 
              onClick={() => removeFromNotebook(entry.id)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-500 p-1 transition-colors"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex gap-4">
              {entry.imageUrl && (
                <img src={entry.imageUrl} alt={entry.term} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-800 truncate">{entry.term}</h3>
                  <AudioButton text={entry.term} lang={entry.targetLang} size="sm" />
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">{entry.definition}</p>
                <p className="text-slate-400 text-xs mt-1">{entry.nativeDefinition}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-50">
               <p className="text-xs text-cyan-600 bg-cyan-50 p-2 rounded-lg line-clamp-2">
                 💡 {entry.usageNote}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotebookPage;
