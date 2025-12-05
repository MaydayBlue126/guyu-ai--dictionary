import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, WordEntry } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Definition Generation ---

interface DefinitionResponse {
  definition: string;
  nativeDefinition: string;
  usageNote: string;
  examples: { sentence: string; translation: string }[];
}

export const generateDefinition = async (
  term: string,
  nativeLang: Language,
  targetLang: Language
): Promise<DefinitionResponse> => {
  const prompt = `
    User input: "${term}".
    Target Language: ${targetLang}.
    Native Language: ${nativeLang}.
    
    Task:
    1. Define the input "${term}" in the Target Language.
    2. Provide a natural definition in the Native Language.
    3. Write a "Usage Note" in the Native Language. This should be fun, lively, and casual (like a friend explaining). Explain nuance, tone, or cultural context. No greetings. Concise.
    4. Provide 2 example sentences in the Target Language with translations in the Native Language.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING, description: `Definition in ${targetLang}` },
          nativeDefinition: { type: Type.STRING, description: `Definition in ${nativeLang}` },
          usageNote: { type: Type.STRING, description: "Fun, casual usage note" },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sentence: { type: Type.STRING, description: `Sentence in ${targetLang}` },
                translation: { type: Type.STRING, description: `Translation in ${nativeLang}` },
              },
            },
          },
        },
        required: ["definition", "nativeDefinition", "usageNote", "examples"],
      },
    },
  });

  if (!response.text) throw new Error("No text response from Gemini");
  return JSON.parse(response.text) as DefinitionResponse;
};

// --- Image Generation ---

export const generateImage = async (term: string, targetLang: Language): Promise<string> => {
  try {
    const prompt = `A fun, bright, pop-art style illustration representing the concept of "${term}" (Language: ${targetLang}). Minimalist, colorful, vector art style. White or light background.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // Nano banana models don't support responseMimeType/Schema
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return ''; 
  } catch (error) {
    console.error("Image generation failed", error);
    return `https://picsum.photos/400/400?blur=2`; // Fallback
  }
};

// --- Story Generation ---

export const generateStory = async (entries: WordEntry[], targetLang: Language): Promise<string> => {
  const words = entries.map(e => e.term).join(", ");
  const prompt = `Write a short, funny, and memorable story in ${targetLang} using these words: ${words}. 
  Keep it simple (A2/B1 level). 
  After the story, provide a brief translation/summary in English (or the most common native language of the words).
  Highlight the used words in the text if possible (e.g. using markdown bold).`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Could not generate story.";
};

// --- Audio (TTS) ---

export const playAudio = async (text: string, lang: Language) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    // The API returns raw PCM 16-bit data at 24kHz.
    // AudioContext.decodeAudioData expects a file format (WAV/MP3) with headers.
    // Since we have raw PCM, we must decode it manually.

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // 1. Base64 decode to Uint8Array
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Convert to Int16Array (PCM 16-bit)
    const pcmData = new Int16Array(bytes.buffer);

    // 3. Create AudioBuffer
    // Mono channel (1), length is number of samples, rate is 24000Hz
    const audioBuffer = audioContext.createBuffer(1, pcmData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);

    // 4. Convert Int16 to Float32 [-1.0, 1.0]
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }
    
    // 5. Play
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);

  } catch (err) {
    console.error("TTS Error", err);
    alert("Could not play audio. Please try again.");
  }
};