-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetPlatform" TEXT NOT NULL,
    "targetAudience" TEXT,
    "brandVoice" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL,
    "originalFilename" TEXT,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "duration" DOUBLE PRECISION,
    "width" INTEGER,
    "height" INTEGER,
    "fps" DOUBLE PRECISION,
    "bitrate" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAnalysis" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "transcript" JSONB,
    "ocrTexts" JSONB,
    "shots" JSONB,
    "scenes" JSONB,
    "keyframes" JSONB,
    "audioAnalysis" JSONB,
    "visualSummary" JSONB,
    "analysisVersion" TEXT NOT NULL DEFAULT 'v0',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViralStructure" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceVideoId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "hookType" TEXT,
    "rhythmPattern" TEXT,
    "emotionCurve" JSONB NOT NULL,
    "beats" JSONB NOT NULL,
    "copyPatterns" JSONB,
    "visualPatterns" JSONB,
    "editingPatterns" JSONB,
    "originalityPolicy" JSONB,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViralStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureTemplate" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "sourceStructureId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "targetPlatforms" JSONB NOT NULL,
    "suitableIndustries" JSONB,
    "recommendedDuration" DOUBLE PRECISION,
    "structure" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationInput" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "productName" TEXT,
    "productDescription" TEXT,
    "sellingPoints" JSONB,
    "targetAudience" TEXT,
    "painPoints" JSONB,
    "brandVoice" TEXT,
    "targetPlatform" TEXT NOT NULL,
    "durationPreference" DOUBLE PRECISION,
    "constraints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedScript" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "generationInputId" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "variantIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "coverText" TEXT,
    "summary" TEXT,
    "fullScript" TEXT NOT NULL,
    "scenes" JSONB NOT NULL,
    "subtitles" JSONB,
    "cta" TEXT,
    "estimatedDuration" DOUBLE PRECISION,
    "similarityScore" DOUBLE PRECISION,
    "originalityScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storyboard" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "scriptId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "scenes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storyboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "originalFilename" TEXT,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "duration" DOUBLE PRECISION,
    "width" INTEGER,
    "height" INTEGER,
    "tags" JSONB,
    "description" TEXT,
    "dominantColors" JSONB,
    "transcript" JSONB,
    "embeddingId" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetEmbedding" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "frameTime" DOUBLE PRECISION,
    "embedding" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMatch" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "storyboardId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "matchReason" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "storyboardId" TEXT,
    "scriptId" TEXT,
    "name" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "fps" DOUBLE PRECISION NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "tracks" JSONB NOT NULL,
    "settings" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "outputStorageKey" TEXT,
    "outputUrl" TEXT,
    "outputDuration" DOUBLE PRECISION,
    "outputFileSize" BIGINT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Video_projectId_idx" ON "Video"("projectId");

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");

-- CreateIndex
CREATE INDEX "Video_role_idx" ON "Video"("role");

-- CreateIndex
CREATE INDEX "VideoAnalysis_videoId_idx" ON "VideoAnalysis"("videoId");

-- CreateIndex
CREATE INDEX "VideoAnalysis_projectId_idx" ON "VideoAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "VideoAnalysis_status_idx" ON "VideoAnalysis"("status");

-- CreateIndex
CREATE INDEX "ViralStructure_projectId_idx" ON "ViralStructure"("projectId");

-- CreateIndex
CREATE INDEX "ViralStructure_sourceVideoId_idx" ON "ViralStructure"("sourceVideoId");

-- CreateIndex
CREATE INDEX "ViralStructure_analysisId_idx" ON "ViralStructure"("analysisId");

-- CreateIndex
CREATE INDEX "StructureTemplate_ownerUserId_idx" ON "StructureTemplate"("ownerUserId");

-- CreateIndex
CREATE INDEX "StructureTemplate_sourceStructureId_idx" ON "StructureTemplate"("sourceStructureId");

-- CreateIndex
CREATE INDEX "StructureTemplate_category_idx" ON "StructureTemplate"("category");

-- CreateIndex
CREATE INDEX "GenerationInput_projectId_idx" ON "GenerationInput"("projectId");

-- CreateIndex
CREATE INDEX "GenerationInput_structureId_idx" ON "GenerationInput"("structureId");

-- CreateIndex
CREATE INDEX "GeneratedScript_projectId_idx" ON "GeneratedScript"("projectId");

-- CreateIndex
CREATE INDEX "GeneratedScript_generationInputId_idx" ON "GeneratedScript"("generationInputId");

-- CreateIndex
CREATE INDEX "GeneratedScript_structureId_idx" ON "GeneratedScript"("structureId");

-- CreateIndex
CREATE INDEX "GeneratedScript_status_idx" ON "GeneratedScript"("status");

-- CreateIndex
CREATE INDEX "Storyboard_projectId_idx" ON "Storyboard"("projectId");

-- CreateIndex
CREATE INDEX "Storyboard_scriptId_idx" ON "Storyboard"("scriptId");

-- CreateIndex
CREATE INDEX "Storyboard_status_idx" ON "Storyboard"("status");

-- CreateIndex
CREATE INDEX "Asset_projectId_idx" ON "Asset"("projectId");

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "AssetEmbedding_assetId_idx" ON "AssetEmbedding"("assetId");

-- CreateIndex
CREATE INDEX "AssetEmbedding_projectId_idx" ON "AssetEmbedding"("projectId");

-- CreateIndex
CREATE INDEX "AssetEmbedding_modality_idx" ON "AssetEmbedding"("modality");

-- CreateIndex
CREATE INDEX "AssetMatch_projectId_idx" ON "AssetMatch"("projectId");

-- CreateIndex
CREATE INDEX "AssetMatch_storyboardId_idx" ON "AssetMatch"("storyboardId");

-- CreateIndex
CREATE INDEX "AssetMatch_sceneId_idx" ON "AssetMatch"("sceneId");

-- CreateIndex
CREATE INDEX "AssetMatch_assetId_idx" ON "AssetMatch"("assetId");

-- CreateIndex
CREATE INDEX "Timeline_projectId_idx" ON "Timeline"("projectId");

-- CreateIndex
CREATE INDEX "Timeline_storyboardId_idx" ON "Timeline"("storyboardId");

-- CreateIndex
CREATE INDEX "Timeline_scriptId_idx" ON "Timeline"("scriptId");

-- CreateIndex
CREATE INDEX "Timeline_status_idx" ON "Timeline"("status");

-- CreateIndex
CREATE INDEX "RenderJob_projectId_idx" ON "RenderJob"("projectId");

-- CreateIndex
CREATE INDEX "RenderJob_timelineId_idx" ON "RenderJob"("timelineId");

-- CreateIndex
CREATE INDEX "RenderJob_userId_idx" ON "RenderJob"("userId");

-- CreateIndex
CREATE INDEX "RenderJob_status_idx" ON "RenderJob"("status");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAnalysis" ADD CONSTRAINT "VideoAnalysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAnalysis" ADD CONSTRAINT "VideoAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViralStructure" ADD CONSTRAINT "ViralStructure_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViralStructure" ADD CONSTRAINT "ViralStructure_sourceVideoId_fkey" FOREIGN KEY ("sourceVideoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViralStructure" ADD CONSTRAINT "ViralStructure_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "VideoAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureTemplate" ADD CONSTRAINT "StructureTemplate_sourceStructureId_fkey" FOREIGN KEY ("sourceStructureId") REFERENCES "ViralStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationInput" ADD CONSTRAINT "GenerationInput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationInput" ADD CONSTRAINT "GenerationInput_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "ViralStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedScript" ADD CONSTRAINT "GeneratedScript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedScript" ADD CONSTRAINT "GeneratedScript_generationInputId_fkey" FOREIGN KEY ("generationInputId") REFERENCES "GenerationInput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedScript" ADD CONSTRAINT "GeneratedScript_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "ViralStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storyboard" ADD CONSTRAINT "Storyboard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storyboard" ADD CONSTRAINT "Storyboard_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "GeneratedScript"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEmbedding" ADD CONSTRAINT "AssetEmbedding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMatch" ADD CONSTRAINT "AssetMatch_storyboardId_fkey" FOREIGN KEY ("storyboardId") REFERENCES "Storyboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMatch" ADD CONSTRAINT "AssetMatch_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_storyboardId_fkey" FOREIGN KEY ("storyboardId") REFERENCES "Storyboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "GeneratedScript"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
