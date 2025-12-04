import { Language } from './types';

export const LANGUAGES = Object.values(Language);

export const DEFAULT_NATIVE_LANG = Language.English;
export const DEFAULT_TARGET_LANG = Language.Spanish;

// Helper to get a short code for TTS if needed, though Gemini handles full names well.
export const getLangCode = (lang: Language): string => {
  switch (lang) {
    case Language.English: return 'en-US';
    case Language.Spanish: return 'es-ES';
    case Language.French: return 'fr-FR';
    case Language.German: return 'de-DE';
    case Language.Chinese: return 'zh-CN';
    case Language.Japanese: return 'ja-JP';
    case Language.Korean: return 'ko-KR';
    case Language.Portuguese: return 'pt-BR';
    case Language.Russian: return 'ru-RU';
    case Language.Arabic: return 'ar-SA';
    case Language.Hindi: return 'hi-IN';
    case Language.Italian: return 'it-IT';
    default: return 'en-US';
  }
};
