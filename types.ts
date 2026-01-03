export interface StickerGenerationResult {
  originalImage: string; // Base64 or URL
  generatedImage: string; // Base64 or URL
  processedImage: string | null; // Image after chroma key removal
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ApiError {
  message: string;
}