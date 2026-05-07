import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client as MinioClient } from "minio";
import { randomUUID } from "node:crypto";
import type { Env } from "../config/env.schema";
import type { KycFileKind } from "@suknaa/types";

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

  async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName);
    }
  }

  async ensureKycBucketExists(): Promise<void> {
    await this.ensureBucketExists(this.kycBucket);
  }

  async putObject(
    bucketName: string,
    objectKey: string,
    buffer: Buffer,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.client.putObject(bucketName, objectKey, buffer, buffer.byteLength, metadata);
  }

  async objectExists(bucketName: string, objectKey: string): Promise<boolean> {
    try {
      await this.client.statObject(bucketName, objectKey);
      return true;
    } catch {
      return false;
    }
  }

  buildKycObjectKey(params: {
    userId: string;
    fileKind: KycFileKind;
    fileExtension: string;
  }): string {
    const ext = params.fileExtension.startsWith(".")
      ? params.fileExtension
      : `.${params.fileExtension}`;
    return `kyc/${params.userId}/${params.fileKind}-${randomUUID()}${ext}`;
  }
}
