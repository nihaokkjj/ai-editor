import { Injectable } from "@nestjs/common";

@Injectable()
export class AiService {
  async analyzeViralStructure() {
    return {
      status: "not_implemented",
      message: "Structure analysis will be implemented after ASR and shot detection are wired.",
    };
  }
}
