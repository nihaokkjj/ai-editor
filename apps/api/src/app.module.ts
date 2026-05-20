import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalysisModule } from "./modules/analysis/analysis.module";
import { AiModule } from "./modules/ai/ai.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { AuthModule } from "./modules/auth/auth.module";
import { GenerationsModule } from "./modules/generations/generations.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { RenderJobsModule } from "./modules/render-jobs/render-jobs.module";
import { StorageModule } from "./modules/storage/storage.module";
import { StoryboardsModule } from "./modules/storyboards/storyboards.module";
import { StructuresModule } from "./modules/structures/structures.module";
import { TimelinesModule } from "./modules/timelines/timelines.module";
import { VideosModule } from "./modules/videos/videos.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    VideosModule,
    AnalysisModule,
    StructuresModule,
    GenerationsModule,
    StoryboardsModule,
    AssetsModule,
    TimelinesModule,
    RenderJobsModule,
    JobsModule,
    StorageModule,
    AiModule,
  ],
})
export class AppModule {}
