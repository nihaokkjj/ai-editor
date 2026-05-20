import { TargetPlatform } from "@ai-editor/shared";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateProjectDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TargetPlatform)
  targetPlatform: TargetPlatform = TargetPlatform.Douyin;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  targetAudience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  brandVoice?: string;
}
