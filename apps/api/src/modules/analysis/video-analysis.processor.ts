import { Injectable } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { AnalysisService } from "./analysis.service";
import { VideoProbeService } from "./services/video-probe.service";
import { WhisperService } from "./services/whisper.service";
import { SceneDetectionService } from "./services/scene-detection.service";
import { VideoAnalysisNormalizerService } from "./services/video-analysis-normalizer.service";
import { VideosService } from "../videos/videos.service";

type AnalyzeVideoJob = {
  analysisId: string;
  videoId: string;
  projectId: string;
};

@Injectable()
@Processor("video-analysis")
export class VideoAnalysisProcessor extends WorkerHost {
  constructor(
    private readonly config: ConfigService,
    private readonly analysisService: AnalysisService,
    private readonly videosService: VideosService,
    private readonly videoProbeService: VideoProbeService,
    private readonly whisperService: WhisperService,
    private readonly sceneDetectionService: SceneDetectionService,
    private readonly normalizer: VideoAnalysisNormalizerService,
  ) {
    super();
  }

  async process(job: Job<AnalyzeVideoJob>) {
    await this.analysisService.markRunning(job.data.analysisId);
    await job.updateProgress(5);

    const video = await this.videosService.findById(job.data.videoId);
    if (!video) {
      throw new Error("Video not found.");
    }

    const sourcePath = await this.videosService.resolveLocalPath(video.storageKey);
    const workDir = await this.createWorkDir(job.data.analysisId);

    try {
      const probe = await this.videoProbeService.probe(sourcePath);
      await job.updateProgress(20);

      const audioPath = path.join(workDir, "audio.wav");
      const ffmpeg = this.config.get<string>("FFMPEG_BIN", "ffmpeg");
      const commandTimeoutMs = this.config.get<number>("VIDEO_ANALYSIS_COMMAND_TIMEOUT_MS", 600000);

      const { CliRunnerService } = await import("./services/cli-runner.service");
      const cliRunner = new CliRunnerService(this.config);

      await cliRunner.run(ffmpeg, ["-y", "-i", sourcePath, "-vn", "-ac", "1", "-ar", "16000", audioPath], {
        cwd: workDir,
        timeoutMs: commandTimeoutMs,
      });
      await job.updateProgress(35);

      const transcript = await this.whisperService.transcribe(audioPath, path.join(workDir, "whisper"));
      await job.updateProgress(60);

      const shots = await this.sceneDetectionService.detect(sourcePath, path.join(workDir, "scenes"), probe.duration);
      await job.updateProgress(80);

      const keyframeDir = path.join(workDir, "keyframes");
      await fs.mkdir(keyframeDir, { recursive: true });
      const keyframePaths: string[] = [];
      const maxKeyframes = this.config.get<number>("VIDEO_ANALYSIS_MAX_KEYFRAMES", 120);

      for (const [index, shot] of shots.slice(0, maxKeyframes).entries()) {
        const midpoint = shot.start + shot.duration / 2;
        const keyframePath = path.join(keyframeDir, `shot_${String(index + 1).padStart(3, "0")}.jpg`);
        await cliRunner.run(ffmpeg, ["-y", "-ss", String(midpoint), "-i", sourcePath, "-frames:v", "1", keyframePath], {
          cwd: workDir,
          timeoutMs: commandTimeoutMs,
        });
        keyframePaths.push(keyframePath);
      }

      await job.updateProgress(90);
      const result = this.normalizer.normalize({
        duration: probe.duration,
        width: probe.width,
        height: probe.height,
        fps: probe.fps,
        bitrate: probe.bitrate,
        transcript,
        shots,
        keyframePaths,
      });

      await this.analysisService.markCompleted(job.data.analysisId, result);
      await job.updateProgress(100);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Video analysis failed.";
      await this.analysisService.markFailed(job.data.analysisId, message);
      throw error;
    } finally {
      if (!this.config.get<boolean>("KEEP_ANALYSIS_WORKDIR", false)) {
        await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
      }
    }
  }

  private async createWorkDir(analysisId: string) {
    const root = this.config.get<string>("VIDEO_ANALYSIS_WORK_DIR");
    const baseDir = root ? path.resolve(root) : path.join(os.tmpdir(), "ai-editor-video-analysis");
    await fs.mkdir(baseDir, { recursive: true });
    return fs.mkdtemp(path.join(baseDir, `${analysisId}-${randomUUID()}-`));
  }
}
