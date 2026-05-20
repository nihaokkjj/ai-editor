import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateProjectDto } from "./projects.dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  list() {
    return this.projectsService.list();
  }

  @Get(":projectId")
  findById(@Param("projectId") projectId: string) {
    return this.projectsService.findById(projectId);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }
}
