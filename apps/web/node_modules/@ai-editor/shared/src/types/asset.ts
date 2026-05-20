import { TranscriptSegment } from "./analysis";

export type AssetType = "video" | "image" | "audio" | "text" | "logo";

export type AssetTag = {
  name: string;
  category: "subject" | "scene" | "emotion" | "action" | "product" | "quality" | "format";
  confidence?: number;
};

export type AssetRequirement = {
  id: string;
  type: AssetType;
  description: string;
  tags: string[];
  idealDuration?: number;
  priority: "required" | "recommended" | "optional";
};

export type Asset = {
  id: string;
  projectId: string;
  userId?: string | null;
  type: AssetType;
  originalFilename?: string | null;
  storageKey: string;
  publicUrl?: string | null;
  mimeType: string;
  fileSize: number;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  tags?: AssetTag[];
  description?: string | null;
  dominantColors?: string[];
  transcript?: TranscriptSegment[];
  qualityScore?: number | null;
  status: "uploaded" | "indexing" | "ready" | "failed";
};

export type AssetMatch = {
  id: string;
  projectId: string;
  storyboardId: string;
  sceneId: string;
  assetId: string;
  matchReason?: string | null;
  confidenceScore: number;
  rank: number;
};
