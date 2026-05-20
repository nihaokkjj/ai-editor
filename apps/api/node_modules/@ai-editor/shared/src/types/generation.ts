import { StructureBeatRole, TargetPlatform } from "../enums";
import { AssetRequirement } from "./asset";
import { SubtitleClip } from "./timeline";

export type GenerationInput = {
  id: string;
  projectId: string;
  structureId: string;
  topic: string;
  productName?: string;
  productDescription?: string;
  sellingPoints?: string[];
  targetAudience?: string;
  painPoints?: string[];
  brandVoice?: "professional" | "friendly" | "sharp" | "funny" | "premium" | "authentic";
  targetPlatform: TargetPlatform;
  durationPreference?: number;
};

export type GeneratedScene = {
  id: string;
  beatId: string;
  start: number;
  end: number;
  role: StructureBeatRole;
  voiceover?: string;
  subtitle: string;
  visualDirection: string;
  shotDirection: string;
  editingDirection?: string;
  audioDirection?: string;
  assetRequirements: AssetRequirement[];
};

export type GeneratedScript = {
  id: string;
  projectId: string;
  generationInputId: string;
  structureId: string;
  variantIndex: number;
  title: string;
  coverText?: string;
  summary?: string;
  fullScript: string;
  scenes: GeneratedScene[];
  subtitles?: SubtitleClip[];
  cta?: string;
  estimatedDuration?: number;
  similarityScore?: number;
  originalityScore?: number;
  qualityScore?: number;
  status: "draft" | "selected" | "archived";
};
