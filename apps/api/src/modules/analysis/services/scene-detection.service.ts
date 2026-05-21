import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ShotSegment } from "@ai-editor/shared";
import { CliRunnerService } from "./cli-runner.service";

@Injectable()
export class SceneDetectionService {
  constructor(
    private readonly cliRunner: CliRunnerService,
    private readonly config: ConfigService,
  ) {}

  async detect(inputPath: string, outputDir: string, fallbackDuration?: number): Promise<ShotSegment[]> {
    await fs.mkdir(outputDir, { recursive: true });

    const scenedetect = this.config.get<string>("SCENEDETECT_BIN", "scenedetect");
    await this.cliRunner.run(scenedetect, ["-i", inputPath, "detect-content", "list-scenes", "-o", outputDir]);

    const files = await fs.readdir(outputDir);
    const csvFile = files.find((file) => file.toLowerCase().endsWith(".csv"));
    if (!csvFile) {
      return this.fallbackShot(fallbackDuration);
    }

    const raw = await fs.readFile(path.join(outputDir, csvFile), "utf8");
    const shots = this.parseCsv(raw);

    return shots.length > 0 ? shots : this.fallbackShot(fallbackDuration);
  }

  private parseCsv(raw: string): ShotSegment[] {
    const rows = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => this.parseCsvLine(line));

    const headerIndex = rows.findIndex((row) => row.some((cell) => cell.toLowerCase().includes("start")));
    if (headerIndex === -1) {
      return [];
    }

    const header = rows[headerIndex].map((cell) => cell.toLowerCase());
    const startIndex = this.findColumn(header, ["start time (seconds)", "start time", "start"]);
    const endIndex = this.findColumn(header, ["end time (seconds)", "end time", "end"]);

    if (startIndex === -1 || endIndex === -1) {
      return [];
    }

    return rows.slice(headerIndex + 1).flatMap((row, index) => {
      const start = this.parseTime(row[startIndex]);
      const end = this.parseTime(row[endIndex]);

      if (start === undefined || end === undefined || end <= start) {
        return [];
      }

      return [{
        id: `shot_${index + 1}`,
        start,
        end,
        duration: end - start,
        shotType: "unknown" as const,
        cameraMotion: "unknown" as const,
      }];
    });
  }

  private parseCsvLine(line: string) {
    const cells: string[] = [];
    let cell = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        quoted = !quoted;
        continue;
      }

      if (char === "," && !quoted) {
        cells.push(cell.trim());
        cell = "";
        continue;
      }

      cell += char;
    }

    cells.push(cell.trim());
    return cells;
  }

  private findColumn(header: string[], names: string[]) {
    for (const name of names) {
      const index = header.findIndex((cell) => cell === name || cell.includes(name));
      if (index !== -1) {
        return index;
      }
    }

    return -1;
  }

  private parseTime(value?: string) {
    if (!value) {
      return undefined;
    }

    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const match = value.match(/(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)/);
    if (!match) {
      return undefined;
    }

    const hours = Number(match[1] ?? 0);
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);

    return hours * 3600 + minutes * 60 + seconds;
  }

  private fallbackShot(duration?: number): ShotSegment[] {
    if (!duration || duration <= 0) {
      return [];
    }

    return [{
      id: "shot_1",
      start: 0,
      end: duration,
      duration,
      shotType: "unknown",
      cameraMotion: "unknown",
    }];
  }
}
