import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { TranscriptSegment } from "@ai-editor/shared";
import { CliRunnerService } from "./cli-runner.service";

type WhisperSegment = {
  start?: number;
  end?: number;
  text?: string;
  avg_logprob?: number;
};

type WhisperOutput = {
  segments?: WhisperSegment[];
};

@Injectable()
export class WhisperService {
  constructor(
    private readonly cliRunner: CliRunnerService,
    private readonly config: ConfigService,
  ) {}

  async transcribe(audioPath: string, outputDir: string): Promise<TranscriptSegment[]> {
    await fs.mkdir(outputDir, { recursive: true });

    const whisper = this.config.get<string>("WHISPER_BIN", "whisper");
    const model = this.config.get<string>("WHISPER_MODEL", "base");

    await this.cliRunner.run(whisper, [audioPath, "--output_format", "json", "--output_dir", outputDir, "--model", model]);

    const files = await fs.readdir(outputDir);
    const jsonFile = files.find((file) => file.endsWith(".json"));
    if (!jsonFile) {
      return [];
    }

    const raw = await fs.readFile(path.join(outputDir, jsonFile), "utf8");
    const parsed = JSON.parse(raw) as WhisperOutput | WhisperSegment[];
    const segments = Array.isArray(parsed) ? parsed : parsed.segments ?? [];

    return segments
      .filter((segment) => typeof segment.start === "number" && typeof segment.end === "number" && segment.text)
      .map((segment, index) => ({
        id: `transcript_${index + 1}`,
        start: segment.start ?? 0,
        end: segment.end ?? 0,
        text: segment.text?.trim() ?? "",
        confidence: this.confidenceFromLogprob(segment.avg_logprob),
      }));
  }

  private confidenceFromLogprob(value?: number) {
    if (value === undefined) {
      return undefined;
    }

    return Math.max(0, Math.min(1, Math.exp(value)));
  }
}
