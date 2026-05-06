import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  MessageProvider,
  MessageSendResult,
  OutboundMessage,
} from "./message-provider.interface";

@Injectable()
export class WhatsAppProvider implements MessageProvider {
  async send(_message: OutboundMessage): Promise<MessageSendResult> {
    throw new NotImplementedException({
      code: "WHATSAPP_PROVIDER_DISABLED",
      message: "WhatsApp provider is disabled in Milestone 3",
      message_en: "WhatsApp provider is disabled in Milestone 3",
    });
  }
}
