import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateVideoAnalysisDto {
  @IsString()
  @MaxLength(64)
  projectId!: string;

  @IsString()
  @MaxLength(1000)
  localPath!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalFilename?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  role?: string;
}
