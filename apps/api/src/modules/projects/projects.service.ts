import { Injectable } from "@nestjs/common";
import { ProjectStatus } from "@ai-editor/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProjectDto } from "./projects.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  findById(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
    });
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        targetPlatform: dto.targetPlatform,
        targetAudience: dto.targetAudience,
        brandVoice: dto.brandVoice,
        status: ProjectStatus.Draft,
      },
    });
  }
}
