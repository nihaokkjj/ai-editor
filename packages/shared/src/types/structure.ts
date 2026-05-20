import { AspectRatio, StructureBeatRole, StructureGenre, TargetPlatform } from "../enums";
import { AssetRequirement } from "./asset";

export type EmotionPoint = {
  time: number;
  emotion: "curiosity" | "anxiety" | "surprise" | "trust" | "desire" | "relief" | "urgency";
  intensity: number;
};

export type StructureBeat = {
  id: string;
  start: number;
  end: number;
  duration: number;
  role: StructureBeatRole;
  intent: string;
  hookType?: string;
  copyPattern: string;
  visualPattern: string;
  audioPattern?: string;
  editingPattern?: string;
  pacing?: "fast" | "medium" | "slow";
  requiredAssets?: AssetRequirement[];
};

export type ViralStructure = {
  id: string;
  sourceVideoId: string;
  analysisId: string;
  platform: TargetPlatform;
  genre: StructureGenre;
  duration: number;
  aspectRatio: AspectRatio;
  hookType?: string;
  rhythmPattern?: string;
  emotionCurve: EmotionPoint[];
  beats: StructureBeat[];
  confidenceScore?: number;
};
