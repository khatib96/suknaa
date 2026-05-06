import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.schema";
import type {
  MessageProvider,
  MessageSendResult,
  OutboundMessage,
} from "./message-provider.interface";

@Injectable()
export class MockMessageProvider implements MessageProvider {
  constructor(private readonly config: ConfigService<Env, true>) {}

  async send(message: OutboundMessage): Promise<MessageSendResult> {
    const outboxDir = path.resolve(
      process.cwd(),
      this.config.get("DEV_OUTBOX_DIR", { infer: true }),
    );
    await mkdir(outboxDir, { recursive: true });

    const messageId = randomUUID();
    const acceptedAt = new Date();
    const fileName = `${acceptedAt.toISOString().replaceAll(":", "-")}-${messageId}.json`;
    const filePath = path.join(outboxDir, fileName);

    await writeFile(
      filePath,
      JSON.stringify(
        {
          provider: "mock",
          messageId,
          acceptedAt: acceptedAt.toISOString(),
          recipient: message.recipient,
          subject: message.subject ?? null,
          body: message.body,
          metadata: message.metadata ?? {},
        },
        null,
        2,
      ),
      "utf8",
    );

    return {
      provider: "mock",
      messageId,
      acceptedAt,
    };
  }
}
