import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import type { Prisma } from "@prisma/client";
import { JobStatus } from "@ai-editor/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { VideosService } from "../videos/videos.service";
import { CreateVideoAnalysisDto } from "./analysis.dto";

type VideoAnalysisPayload = {
  transcript: Prisma.InputJsonValue;
  ocrTexts: Prisma.InputJsonValue;
  shots: Prisma.InputJsonValue;
  scenes: Prisma.InputJsonValue;
  keyframes: Prisma.InputJsonValue;
  audioAnalysis: Prisma.InputJsonValue;
  visualSummary: Prisma.InputJsonValue;
};

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videosService: VideosService,
    @InjectQueue("video-analysis") private readonly videoAnalysisQueue: Queue,
  ) {}

  async createVideoAnalysis(dto: CreateVideoAnalysisDto) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    if (!dto.localPath) {
      throw new BadRequestException("localPath is required for the first analysis version.");
    }

    const video = await this.videosService.createFromLocalPath({
      projectId: dto.projectId,
      localPath: dto.localPath,
      originalFilename: dto.originalFilename,
      mimeType: dto.mimeType,
      role: dto.role,
    });

    const analysis = await this.prisma.videoAnalysis.create({
      data: {
        videoId: video.id,
        projectId: dto.projectId,
        status: JobStatus.Pending,
        analysisVersion: "v1",
      },
    });

    await this.videoAnalysisQueue.add(
      "analyze-video",
      {
        analysisId: analysis.id,
        videoId: video.id,
        projectId: dto.projectId,
      },
      {
        jobId: analysis.id,
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return {
      analysisId: analysis.id,
      videoId: video.id,
      jobId: analysis.id,
      status: analysis.status,
    };
  }

  async findById(analysisId: string) {
    const analysis = await this.prisma.videoAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      throw new NotFoundException("Analysis not found.");
    }

    const job = await this.videoAnalysisQueue.getJob(analysisId);
    const progress = job ? (typeof job.progress === "number" ? job.progress : 0) : this.progressFromStatus(analysis.status);

    return {
      ...analysis,
      progress,
      queueState: job ? await job.getState() : null,
    };
  }

  async markRunning(analysisId: string) {
    const analysis = await this.prisma.videoAnalysis.findUnique({
      where: { id: analysisId },
      select: { videoId: true },
    });

    if (!analysis) {
      throw new NotFoundException("Analysis not found.");
    }

    await this.prisma.$transaction([
      this.prisma.videoAnalysis.update({
        where: { id: analysisId },
        data: { status: JobStatus.Running },
      }),
      this.prisma.video.update({
        where: { id: analysis.videoId },
        data: { status: "processing" },
      }),
    ]);
  }

  async markCompleted(analysisId: string, result: VideoAnalysisPayload) {
    const analysis = await this.prisma.videoAnalysis.findUnique({
      where: { id: analysisId },
      select: { videoId: true },
    });

    if (!analysis) {
      throw new NotFoundException("Analysis not found.");
    }

    await this.prisma.$transaction([
      this.prisma.videoAnalysis.update({
        where: { id: analysisId },
        data: {
          status: JobStatus.Completed,
          transcript: result.transcript,
          ocrTexts: result.ocrTexts,
          shots: result.shots,
          scenes: result.scenes,
          keyframes: result.keyframes,
          audioAnalysis: result.audioAnalysis,
          visualSummary: result.visualSummary,
        },
      }),
      this.prisma.video.update({
        where: { id: analysis.videoId },
        data: { status: "ready" },
      }),
    ]);
  }

  async markFailed(analysisId: string, errorMessage: string) {
    const analysis = await this.prisma.videoAnalysis.findUnique({
      where: { id: analysisId },
      select: { videoId: true },
    });

    if (!analysis) {
      throw new NotFoundException("Analysis not found.");
    }

    await this.prisma.$transaction([
      this.prisma.videoAnalysis.update({
        where: { id: analysisId },
        data: {
          status: JobStatus.Failed,
          errorMessage,
        },
      }),
      this.prisma.video.update({
        where: { id: analysis.videoId },
        data: { status: "failed" },
      }),
    ]);
  }

  private progressFromStatus(status: string) {
    if (status === JobStatus.Completed || status === JobStatus.Failed) {
      return 100;
    }

    return 0;
  }
}
