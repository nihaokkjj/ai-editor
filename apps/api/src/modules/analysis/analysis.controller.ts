import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { CreateVideoAnalysisDto } from "./analysis.dto";

@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post("video")
  createVideoAnalysis(@Body() dto: CreateVideoAnalysisDto) {
    return this.analysisService.createVideoAnalysis(dto);
  }

  @Get(":analysisId")
  findById(@Param("analysisId") analysisId: string) {
    return this.analysisService.findById(analysisId);
  }
}
