export enum Language {
  English = 'English',
  Spanish = 'Spanish',
  French = 'French',
  German = 'German',
  Chinese = 'Chinese (Mandarin)',
  Japanese = 'Japanese',
  Korean = 'Korean',
  Portuguese = 'Portuguese',
  Russian = 'Russian',
  Arabic = 'Arabic',
  Hindi = 'Hindi',
  Italian = 'Italian'
}

export interface Example {
  sentence: string;
  translation: string;
}

export interface WordEntry {
  id: string;
  term: string;
  definition: string;
  nativeDefinition: string;
  usageNote: string;
  examples: Example[];
  imageUrl?: string;
  targetLang: Language;
  nativeLang: Language;
  createdAt: number;
}

export interface NotebookStore {
  entries: WordEntry[];
  addEntry: (entry: WordEntry) => void;
  removeEntry: (id: string) => void;
  hasEntry: (id: string) => boolean;
}
