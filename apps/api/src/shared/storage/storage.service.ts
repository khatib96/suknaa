import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client as MinioClient } from "minio";
import type { Env } from "../config/env.schema";

@Injectable()
export class StorageService {
  readonly client: MinioClient;
  readonly kycBucket: string;

  constructor(config: ConfigService<Env, true>) {
    const endpoint = new URL(config.get("MINIO_ENDPOINT", { infer: true }));
    const useSsl = config.get("MINIO_USE_SSL", { infer: true });
    this.client = new MinioClient({
      endPoint: endpoint.hostname,
      port: endpoint.port
        ? Number(endpoint.port)
        : useSsl
          ? 443
          : 80,
      useSSL: useSsl,
      accessKey: config.get("MINIO_ACCESS_KEY", { infer: true }),
      secretKey: config.get("MINIO_SECRET_KEY", { infer: true }),
    });
    this.kycBucket = config.get("MINIO_KYC_BUCKET", { infer: true });
  }

  /** Readiness probe used by `/v1/health`. Listing buckets is cheap. */
  async ping(): Promise<void> {
    await this.client.listBuckets();
  }
}
