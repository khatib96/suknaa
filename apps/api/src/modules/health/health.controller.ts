import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { RedisService } from "../../shared/redis/redis.service";
import { StorageService } from "../../shared/storage/storage.service";

type Status = "ok" | "down";

interface HealthResponse {
  status: Status;
  db: Status;
  redis: Status;
  storage: Status;
  version: string;
}

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description:
      "Readiness probe. Each dependency is reported individually; `status` is `ok` only when all three are reachable.",
  })
  async health(): Promise<HealthResponse> {
    const [db, redis, storage] = await Promise.all([
      this.probe(() => this.prisma.ping()),
      this.probe(() => this.redis.ping()),
      this.probe(() => this.storage.ping()),
    ]);

    const status: Status =
      db === "ok" && redis === "ok" && storage === "ok" ? "ok" : "down";

    return { status, db, redis, storage, version: "0.1.0" };
  }

  private async probe(fn: () => Promise<unknown>): Promise<Status> {
    try {
      await fn();
      return "ok";
    } catch {
      return "down";
    }
  }
}
