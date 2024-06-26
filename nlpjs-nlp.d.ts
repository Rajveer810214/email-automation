declare module '@nlpjs/nlp' {
    export class NlpManager {
      constructor(options: { languages: string[] });
      addDocument(language: string, text: string, intent: string): void;
      train(): Promise<void>;
      process(language: string, text: string): Promise<{ intent: string, score: number, answer: string, [key: string]: any }>;
      save(): void;
    }
  }
  