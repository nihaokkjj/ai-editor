import { z } from "zod";
import { TargetPlatform } from "../enums";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  targetPlatform: z.nativeEnum(TargetPlatform).default(TargetPlatform.Douyin),
  targetAudience: z.string().max(1000).optional(),
  brandVoice: z.string().max(120).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
