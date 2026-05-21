import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CliRunnerService } from "./cli-runner.service";

export type VideoMetadata = {
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
};

type FfprobeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  r_frame_rate?: string;
  duration?: string;
};

type FfprobeOutput = {
  streams?: FfprobeStream[];
  format?: {
    duration?: string;
    bit_rate?: string;
  };
};

@Injectable()
export class VideoProbeService {
  constructor(
    private readonly cliRunner: CliRunnerService,
    private readonly config: ConfigService,
  ) {}

  async probe(inputPath: string): Promise<VideoMetadata> {
    const ffprobe = this.config.get<string>("FFPROBE_BIN", "ffprobe");
    const result = await this.cliRunner.run(ffprobe, [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      inputPath,
    ]);

    const parsed = JSON.parse(result.stdout) as FfprobeOutput;
    const videoStream = parsed.streams?.find((stream) => stream.codec_type === "video");

    return {
      duration: this.toNumber(parsed.format?.duration ?? videoStream?.duration),
      width: videoStream?.width,
      height: videoStream?.height,
      fps: this.parseFrameRate(videoStream?.avg_frame_rate ?? videoStream?.r_frame_rate),
      bitrate: this.toInteger(parsed.format?.bit_rate),
    };
  }

  private parseFrameRate(value?: string) {
    if (!value || value === "0/0") {
      return undefined;
    }

    const [numerator, denominator] = value.split("/").map(Number);
    if (!Number.isFinite(numerator)) {
      return undefined;
    }

    if (!denominator) {
      return numerator;
    }

    return numerator / denominator;
  }

  private toNumber(value?: string) {
    if (!value) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toInteger(value?: string) {
    const parsed = this.toNumber(value);
    return parsed === undefined ? undefined : Math.round(parsed);
  }
}
