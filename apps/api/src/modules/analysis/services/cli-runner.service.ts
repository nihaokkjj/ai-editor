import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn } from "node:child_process";

type RunCommandOptions = {
  cwd?: string;
  timeoutMs?: number;
  maxOutputBytes?: number;
};

export type CommandResult = {
  stdout: string;
  stderr: string;
};

@Injectable()
export class CliRunnerService {
  constructor(private readonly config: ConfigService) {}

  run(command: string, args: string[], options: RunCommandOptions = {}) {
    const timeoutMs = options.timeoutMs ?? this.config.get<number>("VIDEO_ANALYSIS_COMMAND_TIMEOUT_MS", 600000);
    const maxOutputBytes = options.maxOutputBytes ?? 1_000_000;

    return new Promise<CommandResult>((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: options.cwd,
        shell: false,
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
      }, timeoutMs);

      child.stdout.on("data", (chunk: Buffer) => {
        stdout = this.appendBounded(stdout, chunk.toString("utf8"), maxOutputBytes);
      });

      child.stderr.on("data", (chunk: Buffer) => {
        stderr = this.appendBounded(stderr, chunk.toString("utf8"), maxOutputBytes);
      });

      child.on("error", (error) => {
        clearTimeout(timer);
        reject(new InternalServerErrorException(`Failed to start ${command}: ${error.message}`));
      });

      child.on("close", (code) => {
        clearTimeout(timer);

        if (timedOut) {
          reject(new InternalServerErrorException(`${command} timed out after ${timeoutMs}ms.`));
          return;
        }

        if (code !== 0) {
          reject(new InternalServerErrorException(`${command} exited with code ${code}: ${this.snippet(stderr || stdout)}`));
          return;
        }

        resolve({ stdout, stderr });
      });
    });
  }

  private appendBounded(current: string, next: string, maxBytes: number) {
    const combined = current + next;
    if (Buffer.byteLength(combined, "utf8") <= maxBytes) {
      return combined;
    }

    return combined.slice(combined.length - maxBytes);
  }

  private snippet(value: string) {
    return value.trim().slice(0, 1000) || "no stderr output";
  }
}
