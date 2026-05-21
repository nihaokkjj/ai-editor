import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VideoStatus } from "@ai-editor/shared";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaService } from "../../prisma/prisma.service";

type CreateLocalVideoInput = {
  projectId: string;
  localPath: string;
  originalFilename?: string;
  mimeType?: string;
  role?: string;
};

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  findById(videoId: string) {
    return this.prisma.video.findUnique({ where: { id: videoId } });
  }

  async createFromLocalPath(input: CreateLocalVideoInput) {
    if (!this.config.get<boolean>("ALLOW_LOCAL_VIDEO_INPUT", false)) {
      throw new BadRequestException("Local video input is disabled. Set ALLOW_LOCAL_VIDEO_INPUT=true to enable it.");
    }

    const root = this.config.get<string>("VIDEO_INPUT_ROOT");
    if (!root) {
      throw new BadRequestException("VIDEO_INPUT_ROOT must be configured when local video input is enabled.");
    }

    const project = await this.prisma.project.findUnique({ where: { id: input.projectId } });
    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    const rootPath = path.resolve(root);
    const requestedPath = path.resolve(rootPath, input.localPath);
    const relativePath = path.relative(rootPath, requestedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new BadRequestException("localPath must resolve under VIDEO_INPUT_ROOT.");
    }

    const stat = await fs.stat(requestedPath).catch(() => null);
    if (!stat?.isFile()) {
      throw new BadRequestException("localPath must point to an existing file.");
    }

    return this.prisma.video.create({
      data: {
        projectId: input.projectId,
        role: input.role ?? "source",
        originalFilename: input.originalFilename ?? path.basename(requestedPath),
        storageKey: `local:${relativePath.split(path.sep).join("/")}`,
        mimeType: input.mimeType ?? this.inferMimeType(requestedPath),
        fileSize: BigInt(stat.size),
        status: VideoStatus.Uploaded,
      },
    });
  }

  async resolveLocalPath(storageKey: string) {
    if (!storageKey.startsWith("local:")) {
      throw new BadRequestException("Only local video inputs are supported in this version.");
    }

    const root = this.config.get<string>("VIDEO_INPUT_ROOT");
    if (!root) {
      throw new BadRequestException("VIDEO_INPUT_ROOT must be configured to resolve local videos.");
    }

    const rootPath = path.resolve(root);
    const requestedPath = path.resolve(rootPath, storageKey.slice("local:".length));
    const relativePath = path.relative(rootPath, requestedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new BadRequestException("Stored local video path resolves outside VIDEO_INPUT_ROOT.");
    }

    return requestedPath;
  }

  private inferMimeType(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();

    if (extension === ".mov") {
      return "video/quicktime";
    }

    if (extension === ".webm") {
      return "video/webm";
    }

    return "video/mp4";
  }
}
