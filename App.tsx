import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Book, GraduationCap, Home, Menu, X, Settings } from 'lucide-react';
import { Language, WordEntry } from './types';
import { DEFAULT_NATIVE_LANG, DEFAULT_TARGET_LANG, LANGUAGES } from './constants';
import HomePage from './pages/Home';
import NotebookPage from './pages/Notebook';
import StudyPage from './pages/Study';

const App: React.FC = () => {
  const [nativeLang, setNativeLang] = useState<Language>(DEFAULT_NATIVE_LANG);
  const [targetLang, setTargetLang] = useState<Language>(DEFAULT_TARGET_LANG);
  const [notebook, setNotebook] = useState<WordEntry[]>(() => {
    const saved = localStorage.getItem('poplingo-notebook');
    return saved ? JSON.parse(saved) : [];
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('poplingo-notebook', JSON.stringify(notebook));
  }, [notebook]);

  const addToNotebook = (entry: WordEntry) => {
    if (!notebook.find(e => e.id === entry.id)) {
      setNotebook(prev => [entry, ...prev]);
    }
  };

  const removeFromNotebook = (id: string) => {
    setNotebook(prev => prev.filter(e => e.id !== id));
  };

  const hasEntry = (id: string) => !!notebook.find(e => e.id === id);

  return (
    <HashRouter>
      <div className="min-h-screen bg-yellow-50 flex flex-col font-sans text-slate-900 pb-20 md:pb-0">
        {/* Header / Nav */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-yellow-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="text-2xl font-black tracking-tighter text-pink-500 flex items-center gap-2">
              <span className="text-3xl">🍿</span> PopLingo
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <NavLinks />
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
             <div className="md:hidden bg-white border-b border-yellow-200 p-4 absolute w-full shadow-lg">
               <nav className="flex flex-col gap-4">
                 <NavLinks mobile onClick={() => setIsMenuOpen(false)} />
               </nav>
             </div>
          )}

          {/* Language Selector Bar (Global) */}
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-sm flex flex-wrap justify-center items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">I speak</span>
              <select 
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value as Language)}
                className="bg-white border border-yellow-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <span className="text-slate-400">→</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">I'm learning</span>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as Language)}
                className="bg-white border border-yellow-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-4xl mx-auto w-full p-4">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  nativeLang={nativeLang} 
                  targetLang={targetLang} 
                  addToNotebook={addToNotebook}
                  hasEntry={hasEntry}
                  removeFromNotebook={removeFromNotebook}
                />
              } 
            />
            <Route 
              path="/notebook" 
              element={
                <NotebookPage 
                  notebook={notebook} 
                  removeFromNotebook={removeFromNotebook} 
                  targetLang={targetLang}
                />
              } 
            />
            <Route 
              path="/study" 
              element={
                <StudyPage notebook={notebook} />
              } 
            />
          </Routes>
        </main>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-40 pb-safe">
           <MobileNavLink to="/" icon={<Home size={24} />} label="Search" />
           <MobileNavLink to="/notebook" icon={<Book size={24} />} label="Notebook" />
           <MobileNavLink to="/study" icon={<GraduationCap size={24} />} label="Study" />
        </div>
      </div>
    </HashRouter>
  );
};

const NavLinks: React.FC<{ mobile?: boolean; onClick?: () => void }> = ({ mobile, onClick }) => {
  const baseClass = mobile 
    ? "flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-50 font-semibold text-slate-700"
    : "flex items-center gap-2 px-4 py-2 rounded-full hover:bg-yellow-100 font-semibold text-slate-600 transition-all";

  return (
    <>
      <Link to="/" onClick={onClick} className={baseClass}>
        <Home size={20} /> Search
      </Link>
      <Link to="/notebook" onClick={onClick} className={baseClass}>
        <Book size={20} /> Notebook
      </Link>
      <Link to="/study" onClick={onClick} className={baseClass}>
        <GraduationCap size={20} /> Study Mode
      </Link>
    </>
  );
}

const MobileNavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 ${isActive ? 'text-pink-500' : 'text-slate-400'}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

export default App;
