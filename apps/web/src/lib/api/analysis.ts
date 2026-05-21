import { apiClient } from "./client";

export type CreateProjectPayload = {
  name: string;
  targetPlatform: string;
};

export type ProjectResponse = {
  id: string;
  name: string;
  targetPlatform: string;
};

export type StartVideoAnalysisPayload = {
  projectId: string;
  localPath: string;
  originalFilename?: string;
  mimeType?: string;
  role?: string;
};

export type StartVideoAnalysisResponse = {
  analysisId: string;
  videoId: string;
  jobId: string;
  status: string;
};

export type AnalysisStatus = "pending" | "running" | "completed" | "failed";

export type AnalysisResult = {
  id: string;
  videoId: string;
  projectId: string;
  status: AnalysisStatus;
  progress?: number;
  queueState?: string | null;
  errorMessage?: string | null;
  transcript?: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    speaker?: string;
    confidence?: number;
  }>;
  shots?: Array<{
    id: string;
    start: number;
    end: number;
    duration: number;
    shotType?: string;
    cameraMotion?: string;
    visualSummary?: string;
  }>;
  visualSummary?: {
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: number;
    shotCount?: number;
    transcriptSegmentCount?: number;
  };
};

export async function createProject(payload: CreateProjectPayload) {
  const { data } = await apiClient.post<ProjectResponse>("/projects", payload);
  return data;
}

export async function startVideoAnalysis(payload: StartVideoAnalysisPayload) {
  const { data } = await apiClient.post<StartVideoAnalysisResponse>("/analysis/video", payload);
  return data;
}

export async function getAnalysis(analysisId: string) {
  const { data } = await apiClient.get<AnalysisResult>(`/analysis/${analysisId}`);
  return data;
}
