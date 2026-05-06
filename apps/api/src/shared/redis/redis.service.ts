import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import type { Env } from "../config/env.schema";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;
  private readonly keyPrefix: string;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get("REDIS_URL", { infer: true });
    this.keyPrefix = config.get("REDIS_KEY_PREFIX", { infer: true });
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

  buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const redisKey = this.buildKey(key);
    const payload = JSON.stringify(value);
    if (typeof ttlSeconds === "number" && ttlSeconds > 0) {
      await this.client.set(redisKey, payload, "EX", ttlSeconds);
      return;
    }
    await this.client.set(redisKey, payload);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const redisKey = this.buildKey(key);
    const value = await this.client.get(redisKey);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  /**
   * INCR with TTL set on first increment (sliding window for the first key set only;
   * for fixed hour window use EXPIRE on first increment — standard rate-limit pattern).
   */
  async incrementWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const redisKey = this.buildKey(key);
    const count = await this.client.incr(redisKey);
    if (count === 1) {
      await this.client.expire(redisKey, ttlSeconds);
    }
    return count;
  }
}
