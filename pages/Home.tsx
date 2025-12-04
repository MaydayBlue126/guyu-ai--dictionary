import React, { useState } from 'react';
import { Search, Loader2, Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import { Language, WordEntry } from '../types';
import * as GeminiService from '../services/geminiService';
import AudioButton from '../components/AudioButton';

interface HomePageProps {
  nativeLang: Language;
  targetLang: Language;
  addToNotebook: (entry: WordEntry) => void;
  removeFromNotebook: (id: string) => void;
  hasEntry: (id: string) => boolean;
}

const HomePage: React.FC<HomePageProps> = ({ 
  nativeLang, 
  targetLang, 
  addToNotebook, 
  removeFromNotebook,
  hasEntry 
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WordEntry | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Parallel execution for speed, but text is most critical.
      // We will wait for definition first to ensure valid term, then image.
      
      const defData = await GeminiService.generateDefinition(query, nativeLang, targetLang);
      
      // Start image generation in background while rendering text (or await if we want complete card pop)
      // Let's await to prevent layout shift.
      const imageUrl = await GeminiService.generateImage(query, targetLang);

      const newEntry: WordEntry = {
        id: crypto.randomUUID(),
        term: query,
        definition: defData.definition,
        nativeDefinition: defData.nativeDefinition,
        usageNote: defData.usageNote,
        examples: defData.examples,
        imageUrl,
        targetLang,
        nativeLang,
        createdAt: Date.now()
      };

      setResult(newEntry);
    } catch (err) {
      console.error(err);
      setError("Oops! The AI got confused. Try a simpler phrase or check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSaved = result ? hasEntry(result.id) : false;

  const toggleSave = () => {
    if (!result) return;
    if (isSaved) {
      removeFromNotebook(result.id);
    } else {
      addToNotebook(result);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8">
      
      <div className="text-center space-y-2 mt-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">say?</span>
        </h1>
        <p className="text-slate-500">Type a word, phrase, or sentence.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Delicious, How are you?, Cat"
          className="w-full p-5 pl-14 rounded-2xl border-2 border-slate-200 shadow-sm text-lg font-medium focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={24} />
        <button 
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-pink-600 disabled:bg-slate-300 transition-colors"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Go"}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-xl w-full text-center font-medium">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in-up">
          
          {/* Header Image */}
          <div className="h-64 w-full bg-slate-100 relative overflow-hidden group">
            {result.imageUrl ? (
              <img 
                src={result.imageUrl} 
                alt={result.term} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
              <div className="flex items-center gap-3">
                 <h2 className="text-4xl font-black text-white drop-shadow-md">{result.term}</h2>
                 <div className="bg-white/20 backdrop-blur-md p-1 rounded-full text-white hover:bg-white hover:text-pink-500 transition-all cursor-pointer">
                    <AudioButton text={result.term} lang={targetLang} />
                 </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Definitions */}
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider text-xs bg-yellow-200 inline-block px-2 py-1 rounded">Translation</h3>
                <button 
                  onClick={toggleSave}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold text-sm transition-all ${isSaved ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
              <p className="text-2xl font-medium text-slate-700 mt-2">{result.definition}</p>
              <p className="text-lg text-slate-500 italic">{result.nativeDefinition}</p>
            </div>

            {/* Usage Note */}
            <div className="bg-cyan-50 p-5 rounded-2xl border border-cyan-100 relative">
               <span className="absolute -top-3 -right-2 text-2xl rotate-12">💡</span>
               <h4 className="font-bold text-cyan-800 mb-2">The Vibe Check</h4>
               <p className="text-cyan-900 leading-relaxed text-sm md:text-base">
                 {result.usageNote}
               </p>
            </div>

            {/* Examples */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Examples</h4>
              {result.examples.map((ex, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="mt-1 flex-shrink-0">
                    <AudioButton text={ex.sentence} lang={targetLang} size="sm" />
                  </div>
                  <div>
                    <p className="text-lg text-slate-800 font-medium group-hover:text-pink-600 transition-colors">{ex.sentence}</p>
                    <p className="text-slate-500">{ex.translation}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
