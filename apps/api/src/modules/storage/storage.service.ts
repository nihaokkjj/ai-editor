import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  getPublicUrl(storageKey: string) {
    const baseUrl = this.config.get<string>("S3_PUBLIC_BASE_URL");
    if (!baseUrl) {
      return null;
    }

    return `${baseUrl.replace(/\/$/, "")}/${storageKey.replace(/^\//, "")}`;
  }
}
