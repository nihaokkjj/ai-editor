import { AspectRatio } from "../enums";

export type SubtitleClip = {
  id: string;
  start: number;
  end: number;
  text: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    position?: "top" | "center" | "bottom";
  };
};

export type TimelineClip = {
  id: string;
  assetId?: string;
  type: "video" | "image" | "audio" | "subtitle" | "text" | "effect";
  start: number;
  end: number;
  sourceStart?: number;
  sourceEnd?: number;
  text?: string;
  transform?: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
  };
};

export type TimelineTrack = {
  id: string;
  type: "video" | "image" | "audio" | "subtitle" | "text" | "effect";
  name: string;
  locked?: boolean;
  muted?: boolean;
  clips: TimelineClip[];
};

export type Timeline = {
  id: string;
  projectId: string;
  storyboardId?: string;
  scriptId?: string;
  name: string;
  duration: number;
  aspectRatio: AspectRatio;
  fps: number;
  width: number;
  height: number;
  tracks: TimelineTrack[];
  status: "draft" | "ready" | "rendering" | "rendered" | "failed";
};
