import { ProjectStatus, TargetPlatform } from "../enums";

export type Project = {
  id: string;
  userId?: string | null;
  name: string;
  description?: string | null;
  targetPlatform: TargetPlatform;
  targetAudience?: string | null;
  brandVoice?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};
