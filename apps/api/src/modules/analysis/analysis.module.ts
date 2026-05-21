import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { VideosModule } from "../videos/videos.module";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { CliRunnerService } from "./services/cli-runner.service";
import { SceneDetectionService } from "./services/scene-detection.service";
import { VideoAnalysisNormalizerService } from "./services/video-analysis-normalizer.service";
import { VideoProbeService } from "./services/video-probe.service";
import { WhisperService } from "./services/whisper.service";
import { VideoAnalysisProcessor } from "./video-analysis.processor";

@Module({
  imports: [PrismaModule, VideosModule, BullModule.registerQueue({ name: "video-analysis" })],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    VideoAnalysisProcessor,
    CliRunnerService,
    VideoProbeService,
    WhisperService,
    SceneDetectionService,
    VideoAnalysisNormalizerService,
  ],
})
export class AnalysisModule {}
