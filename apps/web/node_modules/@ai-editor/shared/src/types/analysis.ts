export type TranscriptSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
};

export type OcrSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
  bbox?: [number, number, number, number];
  confidence?: number;
};

export type ShotSegment = {
  id: string;
  start: number;
  end: number;
  duration: number;
  keyframeUrl?: string;
  shotType?: "close_up" | "medium" | "wide" | "screen_recording" | "product" | "unknown";
  cameraMotion?: "static" | "pan" | "tilt" | "zoom_in" | "zoom_out" | "handheld" | "unknown";
  visualSummary?: string;
};

export type AudioAnalysis = {
  bpm?: number;
  volumePeaks: Array<{
    time: number;
    intensity: number;
  }>;
  musicMood?: string;
  speechRatio?: number;
};

export type VideoAnalysis = {
  id: string;
  videoId: string;
  projectId: string;
  duration?: number;
  transcript: TranscriptSegment[];
  ocrTexts: OcrSegment[];
  shots: ShotSegment[];
  audioAnalysis?: AudioAnalysis;
  status: "pending" | "running" | "completed" | "failed";
};
