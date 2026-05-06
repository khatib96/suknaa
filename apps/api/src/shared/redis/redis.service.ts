import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import type { Env } from "../config/env.schema";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get("REDIS_URL", { infer: true });
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    this.client.on("error", (err) => {
      this.logger.warn(`Redis client error: ${err.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.client.status !== "ready" && this.client.status !== "connect") {
      await this.client.connect().catch((err) => {
        this.logger.warn(`Redis connect failed during boot: ${err.message}`);
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => undefined);
  }

  /** Readiness probe used by `/v1/health`. */
  async ping(): Promise<void> {
    const reply = await this.client.ping();
    if (reply !== "PONG") {
      throw new Error(`Unexpected Redis ping reply: ${reply}`);
    }
  }
}
