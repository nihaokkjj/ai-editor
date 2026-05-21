import { Injectable } from "@nestjs/common";
import { AudioAnalysis, ShotSegment, TranscriptSegment } from "@ai-editor/shared";

export type NormalizedVideoAnalysis = {
  transcript: TranscriptSegment[];
  ocrTexts: [];
  shots: ShotSegment[];
  scenes: Array<{ id: string; start: number; end: number; duration: number; shotIds: string[] }>;
  keyframes: Array<{ id: string; shotId: string; time: number; path?: string }>;
  audioAnalysis: AudioAnalysis;
  visualSummary: {
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: number;
    shotCount: number;
    transcriptSegmentCount: number;
  };
};

@Injectable()
export class VideoAnalysisNormalizerService {
  normalize(input: {
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: number;
    transcript: TranscriptSegment[];
    shots: ShotSegment[];
    keyframePaths: string[];
  }): NormalizedVideoAnalysis {
    const scenes = input.shots.map((shot, index) => ({
      id: `scene_${index + 1}`,
      start: shot.start,
      end: shot.end,
      duration: shot.duration,
      shotIds: [shot.id],
    }));

    const keyframes = input.shots.map((shot, index) => ({
      id: `keyframe_${index + 1}`,
      shotId: shot.id,
      time: shot.start + shot.duration / 2,
      path: input.keyframePaths[index],
    }));

    return {
      transcript: input.transcript,
      ocrTexts: [],
      shots: input.shots,
      scenes,
      keyframes,
      audioAnalysis: {
        volumePeaks: [],
        speechRatio: this.speechRatio(input.transcript, input.duration),
      },
      visualSummary: {
        duration: input.duration,
        width: input.width,
        height: input.height,
        fps: input.fps,
        bitrate: input.bitrate,
        shotCount: input.shots.length,
        transcriptSegmentCount: input.transcript.length,
      },
    };
  }

  private speechRatio(transcript: TranscriptSegment[], duration?: number) {
    if (!duration || duration <= 0) {
      return undefined;
    }

    const totalSpeech = transcript.reduce((sum, segment) => sum + Math.max(0, segment.end - segment.start), 0);
    return Math.max(0, Math.min(1, totalSpeech / duration));
  }
}
