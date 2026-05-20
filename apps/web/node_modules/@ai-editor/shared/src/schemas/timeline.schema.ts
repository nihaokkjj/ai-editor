import { z } from "zod";
import { AspectRatio } from "../enums";

export const timelineClipSchema = z.object({
  id: z.string(),
  assetId: z.string().optional(),
  type: z.enum(["video", "image", "audio", "subtitle", "text", "effect"]),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  sourceStart: z.number().nonnegative().optional(),
  sourceEnd: z.number().positive().optional(),
  text: z.string().optional(),
  transform: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      scale: z.number().optional(),
      rotation: z.number().optional(),
      opacity: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export const timelineTrackSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "image", "audio", "subtitle", "text", "effect"]),
  name: z.string(),
  locked: z.boolean().optional(),
  muted: z.boolean().optional(),
  clips: z.array(timelineClipSchema),
});

export const timelineSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  storyboardId: z.string().optional(),
  scriptId: z.string().optional(),
  name: z.string(),
  duration: z.number().positive(),
  aspectRatio: z.nativeEnum(AspectRatio),
  fps: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  tracks: z.array(timelineTrackSchema),
});

export type TimelineInput = z.infer<typeof timelineSchema>;
