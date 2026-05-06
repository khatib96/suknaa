import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.schema";
import { MockMessageProvider } from "./mock-message.provider";
import { MessagingService } from "./messaging.service";
import { MESSAGE_PROVIDER } from "./messaging.tokens";
import { WhatsAppProvider } from "./whatsapp.provider";

@Global()
@Module({
  providers: [
    MockMessageProvider,
    WhatsAppProvider,
    {
      provide: MESSAGE_PROVIDER,
      inject: [ConfigService, MockMessageProvider, WhatsAppProvider],
      useFactory: (
        config: ConfigService<Env, true>,
        mockProvider: MockMessageProvider,
        whatsAppProvider: WhatsAppProvider,
      ) => {
        const provider = config.get("MESSAGE_PROVIDER", { infer: true });
        return provider === "whatsapp" ? whatsAppProvider : mockProvider;
      },
    },
    MessagingService,
  ],
  exports: [MessagingService, MESSAGE_PROVIDER],
})
export class MessagingModule {}
