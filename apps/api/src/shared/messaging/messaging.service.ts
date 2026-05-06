import { Inject, Injectable } from "@nestjs/common";
import type {
  MessageSendResult,
  OutboundMessage,
} from "./message-provider.interface";
import { MESSAGE_PROVIDER } from "./messaging.tokens";
import type { MessageProvider } from "./message-provider.interface";

@Injectable()
export class MessagingService {
  constructor(
    @Inject(MESSAGE_PROVIDER) private readonly provider: MessageProvider,
  ) {}

  async send(message: OutboundMessage): Promise<MessageSendResult> {
    return this.provider.send(message);
  }
}
